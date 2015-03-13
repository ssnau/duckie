var assert = require('assert');
var t = require('./');
var is = t.is;


describe('basic type', function(){

  it('Number', function() {
    assert.equal(true, is(123, t.number));
    assert.equal(true, is(NaN, t.number));
    assert.equal(true, t.number.test(124));

    assert.equal(false, is('hello', t.number));
    assert.equal(false, is('hello', Number));
  });

  it("String", function(){
    assert.equal(true, is('hello', t.string));
    assert.equal(true, is('hello', String));
    assert.equal(false, is(124, String));
  });

  it("Array", function() {
    assert.equal(true,  is([1,2,4], t.array));
    assert.equal(true,  is([1,2,4], Array));
    assert.equal(true,  is([1,2,4], "array"));

    assert.equal(false, is(1234, t.array));
    assert.equal(false, is(1234, Array));

    assert.equal(false, is('1234', Array));
    assert.equal(false, is({}, Array));
  });

  it("Undefined", function() {
    assert.equal(true,  is(void 0, t.undefined));
    assert.equal(true,  is(void 0, undefined));
    assert.equal(true,  is(void 0, "undefined"));

    assert.equal(false, is(1234, t.undefined));
    assert.equal(false, is('12432', t.undefined));
    assert.equal(false, is({}, t.undefined));
    assert.equal(false, is(null, t.undefined));
    assert.equal(false, is(NaN, t.undefined));
  });

  it("Null", function() {
    assert.equal(true, is(null, t.null));
    assert.equal(true, is(null, null));
    assert.equal(true, is(null, "null"));

    assert.equal(false, is(1234, t.null));
    assert.equal(false, is('12', t.null));
    assert.equal(false, is({}, t.null));
    assert.equal(false, is(NaN, t.null));
    assert.equal(false, is(void 0, t.null));
  });

  it("Object", function() {
    function Construct() {}
    assert.equal(true, is({}, t.object));
    assert.equal(true, is(new Object,  Object));
    assert.equal(true, is(new Date, Object));
    assert.equal(true, is(new Construct, Object));
    assert.equal(true, is(null, Object));

    assert.equal(false, is(1234, Object));
    assert.equal(false, is("124", Object));
    assert.equal(false, is(NaN, Object));
    assert.equal(false, is(void 0, Object));
  });
});

describe("composite type", function() {
  var ArrayOf = t.arrayOf;
  var ObjectOf = t.objectOf;
  var OneOf = t.oneOf;
  var OneOfType = t.oneOfType;
  var MayBe = t.mayBe;
  
  it('ObjectOf', function(){
    assert.ok(
      is(
        {name: "jack"}, 
        ObjectOf({name: String})
      )
    );
    assert.ok(
      is(
        {name: "jack", age: 18}, 
        ObjectOf({name: String})
        )
      );

    assert.equal(false, is(12, ObjectOf({name: String})));
    assert.equal(false, is('12',  ObjectOf({name: String})));
  });

  it('ArrayOf', function(){
    assert.ok(ArrayOf(Number).test([1,2,3]));
    assert.equal(false, ArrayOf(Number).test([1,2,'3']));
    assert.equal(false, ArrayOf(Number).test([1,2,[]]));

    assert.equal(true, ArrayOf({name: String})([
        {name: "jack"},
        {name: "john", age: 18},
        {name: "mary", gender: 'female'}
    ]));

    assert.equal(false, ArrayOf({name: String}).test([
        {name: "jack"},
        {name: "john", age: 18},
        {name: 8, gender: 'female'}
    ]));
  });

  it('composite with shortcut', function() {
    assert.equal(true, is(
      {
        students: [
            {name: null, age: 18},
            {name: 'john', age: 20, gender: 'male'},
          ]
      },
      ObjectOf({
        students: [{
          name: MayBe(String),
          age: Number
        }]
      })
    ));
  });

  it('OneOf', function () {
    assert.equal(true, is(1, OneOf([1,2,3])));
    assert.equal(true, is(2, OneOf([1,2,3])));
    assert.equal(false,is(8, OneOf([1,2,3])));
  });

  it('MayBe', function () {
    assert.equal(true, is({name: 'cc'}, MayBe({name: String})));
    assert.equal(true, is(null, MayBe({name: String})));
    assert.equal(true, t.objectOf({
      name: String,
      age: t.maybe(Number)
    }).test({name: 'jack'}));
  });

  it('OneOfType', function () {
    assert.equal(true, is('ccc', OneOfType([Number, String]) ));
    assert.equal(true, is(1, OneOfType([Number, String]) ));
    assert.equal(true, 
        OneOfType([Number, {name: String}]).test({name: 'hello'})
    );
  });

  it('instanceOf', function() {
    var InstanceOf = t.instanceOf;
    function M(){}

    assert.equal(true, InstanceOf(Date).test(new Date));
    assert.equal(true, InstanceOf(M).test(new M));
    assert.equal(true, InstanceOf(Object).test(new M));
    assert.equal(false, InstanceOf(M).test({}));
  });
});

describe("T shortcut wrap #", function() {
  it('basice type', function() {
    assert.equal(true, t(String).test('abc'));
    assert.equal(true, t('string').test('abc'));
    assert.equal(false, t('string').test(12));

    assert.equal(true, t(Number).test(123));
    assert.equal(true, t('number').test(123));
  });

  it('array type', function() {
    assert.equal(true, t([]).test([1,2,3]));
    assert.equal(true, t(Array).test([1,2,3]));

    assert.equal(false, t([String]).test([1,2,3]));
    assert.equal(true, t([Number]).test([1,2,3]));
    assert.equal(true, t(['*']).test([1,2,3]));
  });

  it('object type', function() {
    assert.equal(true, t({name: String}).test({name: 'jack'}));
    assert.equal(false, t({name: String}).test({name: true}));
  });

  it('composite type', function() {
    assert.equal(false, t([{name: String}]).test({name: 'jack'}));
    assert.equal(true, t([{name: String}]).test([{name: 'jack'}]));
  });

});
