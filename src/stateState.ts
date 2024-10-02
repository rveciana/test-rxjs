import { state } from "@react-rxjs/core";
import { mergeWith, scan, startWith } from "rxjs";
import { Price } from "./model";
import { pricesDtoState$, resetPrices$ } from "./service";

export const pricesState$ = state(
  pricesDtoState$.pipe(
    mergeWith(resetPrices$),
    scan(
      (accum, current: Price | void) =>
        !current
          ? {}
          : {
              ...accum,
              [current.symbol]: current.price,
            },
      {}
    ),
    startWith({})
  )
);
