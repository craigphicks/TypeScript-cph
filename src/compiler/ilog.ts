import { Debug, LogLevel, LoggingHost } from "./debug";


export class ILog implements LoggingHost{
    indent: number = 0;
    oneIndent: string = '  ';

    constructor(){
    }
    log(level: LogLevel, message: string | (() => string)) {
        if (level )
        if (typeof message === 'function') {
            message = message();
        }
    }
    ilog (message: string | (()=>string), level: LogLevel = LogLevel.Info) {
        this.log(level, message);
    }
    ilogGroup (message: string | (()=>string), level: LogLevel = LogLevel.Info) {
        this.log(level, message);
        return this.indent++;
    }
    ilogGroupEnd (message?: string | (()=>string), expectedIndent: number | undefined = undefined, level: LogLevel = LogLevel.Info, ) {
        this.indent--;
        if (expectedIndent!==undefined && expectedIndent!==this.indent) {
            Debug.fail('Expected indent ' + expectedIndent + ' but got ' + this.indent);
        }
        if (message) {
            this.log(level, message);
        }
    }
}

