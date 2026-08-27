
export class AppError extends Error{
    statuscode: number

    constructor(statuscode: number, messege: string){
        super(messege);
        this.statuscode = statuscode;
    }
}