export function bigIntToArray(pow: number, size: number, input: bigint) {
  let mod = BigInt(1);

  for (let i = 0; i < pow; i++) {
    mod *= BigInt(2);
  }

  const res = [];
  let xTemp = input;

  for (let i = 0; i < size; i++) {
    res.push(xTemp % mod);

    xTemp /= mod;
  }

  return res;
}
