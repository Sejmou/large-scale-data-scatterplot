export class MapWithDefault<K, V> extends Map<K, V> {
  constructor(defaultValue: () => V, initialValues?: [key: K, value: V][]) {
    super(initialValues);
    this.defaultValue = defaultValue;
  }
  private defaultValue: () => V;
  get(key: K): V {
    if (!this.has(key)) {
      this.set(key, this.defaultValue());
    }
    return super.get(key) as V;
  }
}
