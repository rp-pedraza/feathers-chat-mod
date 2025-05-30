export default class DataWithID<T> {
  id: number;
  value: T;

  static generateId: (suggestedId: number) => number = (() => {
    let counter: number = 0;
    return (suggestedId: number) => (counter = suggestedId > counter ? suggestedId : counter + 1);
  })();

  constructor(value: T, suggestedId?: number) {
    this.id = DataWithID.generateId(suggestedId ?? 0);
    this.value = value;
  }
}
