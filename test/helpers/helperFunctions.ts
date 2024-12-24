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

export function modInverse(num: bigint, mod: bigint) {
  let m0 = mod;
  let x0 = 0n;
  let x1 = 1n;

  if (mod === 1n) return 0n;

  while (num > 1n) {
    let q = num / mod;
    let t = mod;

    mod = num % mod;
    num = t;
    t = x0;

    x0 = x1 - q * x0;
    x1 = t;
  }

  if (x1 < 0n) {
    x1 += m0;
  }

  return x1;
}

export function pointAdd(x1: bigint, y1: bigint, x2: bigint, y2: bigint, p: bigint) {
  if (x1 === x2 && y1 === y2) {
    throw new Error("Points are the same; use pointDouble instead.");
  }

  if (x1 === x2) {
    return { x: null, y: null };
  }

  let lambda_num = (p + y2 - y1) % p;
  let lambda_den = modInverse((p + x2 - x1) % p, p);
  let lam = (lambda_num * lambda_den) % p;

  let x3 = (2n * p + lam * lam - x1 - x2) % p;
  let y3 = (p + lam * (x1 - x3) - y1) % p;

  if (x3 < 0n) x3 += p;
  if (y3 < 0n) y3 += p;

  return { x: x3, y: y3 };
}

export function pointDouble(x1: bigint, y1: bigint, input: bigint, p: bigint) {
  if (y1 === 0n) {
    return { x: null, y: null };
  }

  let lambda_num = (3n * x1 * x1 + input) % p;
  let lambda_den = modInverse(2n * y1, p);
  let lam = (lambda_num * lambda_den) % p;

  let x3 = (lam * lam - 2n * x1) % p;
  let y3 = (lam * (x1 - x3) - y1) % p;

  if (x3 < 0n) x3 += p;
  if (y3 < 0n) y3 += p;

  return { x: x3, y: y3 };
}

export function pointScalarMul(x: bigint, y: bigint, k: bigint, input: bigint, p: bigint) {
  let x_res = null;
  let y_res = null;

  let x_cur = x;
  let y_cur = y;

  while (k > 0n) {
    if (k & 1n) {
      if (x_res === null && y_res === null) {
        x_res = x_cur;
        y_res = y_cur;
      } else {
        const { x: x_temp, y: y_temp } = pointAdd(x_res!, y_res!, x_cur, y_cur, p);

        x_res = x_temp;
        y_res = y_temp;
      }
    }

    const { x: x_temp, y: y_temp } = pointDouble(x_cur, y_cur, input, p);
    x_cur = x_temp!;
    y_cur = y_temp!;

    k >>= 1n; // Shift k right by 1 bit
  }

  return { x: x_res, y: y_res };
}
