import {
  AssetClass,
  MarginModel,
  PositionDirection,
  ProductType,
} from "@adss/trading-api";

import BigNumber from "bignumber.js";
import { SpyOn, spyOnStateObservable } from "common/spyOnObservable";
import { Subject, Subscription } from "rxjs";
import {
  PositionInfo,
  PositionsMap,
} from "trading-ui/service/positions/positions";
import { state, StateObservable } from "@react-rxjs/core";

let mockThrottledPositionsMap$ = new Subject<PositionsMap>();

jest.doMock("../state", () => {
  const mockThrottledPositionsMapState$ = state(
    () => mockThrottledPositionsMap$
  );

  return {
    throttledPositionsMap$: mockThrottledPositionsMapState$,
  };
});

describe("fillValues$", () => {
  let fillValues$: (
    symbol: string,
    _stop?: undefined
  ) => StateObservable<PositionInfo>;

  beforeAll(async () => {
    const module = await import("./state");
    fillValues$ = module.position$;
  });

  let error: any;
  let subscription: Subscription;
  let spy: SpyOn;

  beforeEach(() => {
    if (fillValues$) {
      spy = spyOnStateObservable(fillValues$("TEST"));
      error = spy.error;
      subscription = spy.subscription;
    } else {
      throw new Error("fillValues$ was not initialized");
    }
  });

  afterAll(() => {
    subscription.unsubscribe();
  });

  const mockedPosition = {
    symbol: "TEST",
    accountNumber: "123",
    productType: ProductType.All,
    legalName: "TEST Legal Name",
    displayName: "TEST Ltd.",
    contractMultiplier: 1,
    contractQuoteCurrency: "GDP",
    contractQuoteCurrencyQuantityIncrement: "0",
    margin: "0",
    priceIncrement: "0",
    priceCollar: 0,
    canTrade: true,
    fractional: true,
    assetClass: AssetClass.Equities,
    instrumentId: 123,
    key: "key",
    positionDirection: PositionDirection.Long,
    fills: {},
    openedQuantity: new BigNumber(0),
    openedCost: new BigNumber(0),
    sumPrice: new BigNumber(0),
    averageOpenedPrice: "0",
    marginModel: MarginModel.Net,
  };
  it("Should take the element with the symbol", () => {
    mockThrottledPositionsMap$.next({
      TEST: {
        Long: mockedPosition,
        Short: mockedPosition,
        Both: mockedPosition,
      },
    });
    expect(spy.latestEmission()).toEqual(undefined);
  });
});
