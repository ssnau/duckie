interface Tester {
  test: (s: any) => boolean;
  assert: (s: any) => void;
  toString: () => string;
}

type TypeDescriptor = 
/* value and contructor */
null | undefined | ObjectConstructor | ArrayConstructor | StringConstructor | FunctionConstructor |
BooleanConstructor | NumberConstructor | ObjectConstructor |
/* string format: array|number|  */
string |
/* Array of anything */
Array<TypeDescriptor> |
/* Object of anything */
{
  [key: string]: TypeDescriptor;
};


type Duckie = (T: TypeDescriptor) => Tester;

interface DuckieProto {
  bool : Tester;
  boolean: Tester;
  string : Tester;
  number : Tester;
  undefined: Tester;
  null: Tester;
  function: Tester;
  array : Tester;
  object : Tester;
  anything: Tester;

  arrayOf: (T: TypeDescriptor) => Tester;
  objectOf: (T: TypeDescriptor) => Tester;
  instanceOf: (T: Function) => Tester;
  oneOf: (T: Array<any>) => Tester;
  oneOfType: (T: Array<TypeDescriptor>) => Tester;
  mayBe: (T: TypeDescriptor) => Tester;
  maybe: (T: TypeDescriptor) => Tester;
  
  assert: (obj: any, typedesc: TypeDescriptor, errorMsg?: string) => void;
  is: (obj: any, typedesc: TypeDescriptor) => boolean;

  createChecker: (checker: (obj: any) => boolean, toString: () => string) => Tester;
}

declare let duckie: DuckieProto & Duckie;
export default duckie;
