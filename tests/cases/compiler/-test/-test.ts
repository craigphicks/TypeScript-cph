

interface Foobar {
    somebody: any;
};
interface JQuery<TElement = Foobar> {
    element: TElement;
    [Symbol.iterator]: () => {
        next(): {
            value: TElement;
        }
        | {
            done: true;
            value: any;
        };
    }
}
declare function jQuery<TElement = Foobar>(): JQuery<TElement>;

const t11: string | JQuery<Foobar> = jQuery(); // no error

const t12: (string | JQuery<Foobar>) & (string | JQuery<Foobar> | undefined) = jQuery(); // error

//type XXX<DT> = <U>()=>any extends
type ContributingFixed<DT> = DT extends ReturnType<typeof jQuery<infer U>> ? ReturnType<typeof jQuery<U>> extends DT ? U : never : never
type T30 = ContributingFixed<(string | JQuery<Foobar>) & (string | JQuery<Foobar> | undefined)>;
// Foobar correct

type ContributingInferred<DT> = DT extends ReturnType<typeof jQuery<infer U>> ? U : never;
type TC1 = ContributingInferred<(string | JQuery<Foobar>) & (string | JQuery<Foobar> | undefined)>;


type Results<DT> = DT extends ReturnType<typeof jQuery<infer U>> ? ReturnType<typeof jQuery<U>> : never;
type TR1 = Results<(string | JQuery<Foobar>) & (string | JQuery<Foobar> | undefined)>;

type TC14 = ContributingInferred<JQuery<Foobar> & string>;
type TR14 = Results<JQuery<Foobar> & string>;
type XXX = ReturnType<typeof jQuery<Foobar & string>>;



type CorrectlyFalse01 = (JQuery<Foobar> & string) extends ReturnType<typeof jQuery<string>> ? true : false;
type CorrectlyFalse02 = ReturnType<typeof jQuery<string>> extends JQuery<Foobar> & string ? true : false;
type RHS = ReturnType<typeof jQuery<string>>;
// JQuery<string>

type CorrectlyFalse1 = (JQuery<Foobar> & string) extends JQuery<string> ? true : false;
type CorrectlyFalse2 = JQuery<string> extends (JQuery<Foobar> & string) ? true : false;
type CorrectlyFalse12 =  JQuery<Foobar> extends JQuery<string> ? true : false;
type CorrectlyFalse22 =  string extends JQuery<string> ? true : false;

type FixedToFalse = (JQuery<Foobar> & string) extends ReturnType<typeof jQuery<string>> ? true : false;

// @ts-expect-error
const t20: JQuery<Foobar> & string = (0 as any as JQuery<string>);
// @ts-expect-error
const t21: JQuery<string> = (0 as any as JQuery<Foobar> & string);



