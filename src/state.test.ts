import { Observable, Subject, Subscription } from "rxjs";
import { Price } from "./model";
import { SpyOn, spyOnObservable } from "./spyOnObservable";

let mockPricesDto$: Subject<Price>;
let mockResetPrices$: Subject<void>;

jest.doMock("./service", () => {
  mockPricesDto$ = new Subject();
  mockResetPrices$ = new Subject();
  return {
    pricesDto$: mockPricesDto$,
    resetPrices$: mockResetPrices$,
  };
});

describe("prices$", () => {
  let prices$: Observable<Record<string, number>>;

  beforeAll(async () => {
    const module = await import("./state");
    prices$ = module.prices$;
  });

  let latestEmission: any;
  let error: any;
  let subscription: Subscription;
  let spy: SpyOn;

  beforeEach(() => {
    if (prices$) {
      spy = spyOnObservable(prices$);
      error = spy.error;
      subscription = spy.subscription;
    } else {
      throw new Error("prices$ was not initialized");
    }
  });

  afterAll(() => {
    subscription.unsubscribe();
  });

  it("should initially emit empty object", () => {
    expect(spy.latestEmission()).toEqual({});
  });

  it("should emit object containing latest prices after pricesDto$ emits", () => {
    mockPricesDto$.next({ symbol: "XOM", price: 48.17 });
    expect(spy.latestEmission()).toEqual({ XOM: 48.17 });

    mockPricesDto$.next({ symbol: "BA", price: 218.93 });
    expect(spy.latestEmission()).toEqual({ XOM: 48.17, BA: 218.93 });

    mockPricesDto$.next({ symbol: "XOM", price: 48.21 });
    expect(spy.latestEmission()).toEqual({ XOM: 48.21, BA: 218.93 });
  });

  it("should emit empty object after resetPrices$ emits", () => {
    mockResetPrices$.next();
    expect(spy.latestEmission()).toEqual({});
  });

  it("should emit object containing only the latest prices after pricesDto$ emits", () => {
    mockPricesDto$.next({ symbol: "HD", price: 332.12 });
    mockPricesDto$.next({ symbol: "AA", price: 24.49 });
    expect(spy.latestEmission()).toEqual({ HD: 332.12, AA: 24.49 });
  });

  it("should not error", () => {
    expect(error).not.toBeCalled();
  });
});
