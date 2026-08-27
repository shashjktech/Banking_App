import { creatApp } from "./app";
import { env } from "./config/env";

const app = creatApp();

app.listen(env.port, ()=>{
    console.log(`Server is running on port:${env.port}`);
})