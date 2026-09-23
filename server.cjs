const http=require('node:http');
const fs=require('node:fs');
const path=require('node:path');
const root=path.resolve(__dirname,'dist');
const types={'.html':'text/html; charset=utf-8','.css':'text/css; charset=utf-8','.js':'text/javascript; charset=utf-8','.png':'image/png','.svg':'image/svg+xml','.mp3':'audio/mpeg','.txt':'text/plain; charset=utf-8'};
const server=http.createServer((req,res)=>{
  try{const pathname=decodeURIComponent(new URL(req.url,'http://localhost').pathname);const file=path.resolve(root,'.'+(pathname==='/'?'/index.html':pathname));
    if(!file.startsWith(root+path.sep)){res.writeHead(403);return res.end('Forbidden');}
    fs.stat(file,(err,stat)=>{
      if(err||!stat.isFile()){res.writeHead(404);return res.end('Not found');}
      const headers={'Content-Type':types[path.extname(file)]||'application/octet-stream','Cache-Control':'no-cache','Accept-Ranges':'bytes'};
      if(req.headers.range){
        const match=/^bytes=(\d*)-(\d*)$/.exec(req.headers.range);
        let start=match?.[1]?Number(match[1]):Math.max(0,stat.size-Number(match?.[2]));
        let end=match?.[1]&&match[2]?Math.min(Number(match[2]),stat.size-1):stat.size-1;
        if(!match||(!match[1]&&!match[2])||!Number.isSafeInteger(start)||!Number.isSafeInteger(end)||start>end||start>=stat.size){res.writeHead(416,{'Content-Range':`bytes */${stat.size}`});return res.end();}
        res.writeHead(206,{...headers,'Content-Range':`bytes ${start}-${end}/${stat.size}`,'Content-Length':end-start+1});
        fs.createReadStream(file,{start,end}).pipe(res);return;
      }
      res.writeHead(200,{...headers,'Content-Length':stat.size});fs.createReadStream(file).pipe(res);
    });
  }catch{res.writeHead(400);res.end('Bad request');}
});
server.listen(Number(process.env.PORT)||0,'127.0.0.1',()=>console.log('BLACK SWAN ROULETTE: http://127.0.0.1:'+server.address().port));
