export default class DataWithID<T> {
  _id: number
  _value: T

  static generateId: () => number = (() => {
    let counter: number = 0
    return () => ++counter
  })()

  constructor(value: T) {
    this._id = DataWithID.generateId()
    this._value = value
  }

  get id(): number {
    return this._id
  }

  get value(): T {
    return this._value
  }
}
