import { TokenPayLoad } from "./types";
import { StaffPayload } from "./types";

declare global{
    namespace Express{
        interface Request{
            user: TokenPayLoad
        }
    }
}

declare global {
  namespace Express {
    interface Request {
      staff?: StaffPayload;
    }
  }
}
export{};