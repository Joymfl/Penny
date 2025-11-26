export class Vtable {
    vTable: any = [];

    constructor() {
    }

    pushMethod(fn: any) {
        this.vTable.push(fn);
    }
}