class FormatService {
  currency(
    value: number,
    currency: string = "USD",
    timeZone: string = "es-CL",
  ): string {
    return new Intl.NumberFormat(timeZone, {
      style: "currency",
      currency: currency,
    }).format(value);
  }
}


export default FormatService;