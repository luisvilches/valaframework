class SecurityServices {
  uuid(): string {
    let date: number = new Date().getTime();
    const uuid: string = "xxxxxxxxxxxx4xxxyxxxxxxxxxxxxxxx".replace(
      /[xy]/g,
      (c: any) => {
        const result: number = (date + Math.random() * 16) % 16 | 0;
        date = Math.floor(date / 16);
        return (c == "x" ? result : (result & 0x3 | 0x8)).toString(16);
      },
    );
    return uuid;
  }
}


export default SecurityServices;