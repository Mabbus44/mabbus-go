export function setSelect(val: number): void {
  let list1 = document.getElementById("challengerName") as HTMLSelectElement;
  let list2 = document.getElementById("challengerID") as HTMLSelectElement;
  list1.selectedIndex = val;
  list2.selectedIndex = val;
}

export function setSelect2(val: number): void {
  let list1 = document.getElementById("oponentName") as HTMLSelectElement;
  let list2 = document.getElementById("matchID") as HTMLSelectElement;
  list1.selectedIndex = val;
  list2.selectedIndex = val;
}

export function btnGoToGame(): void {
  let list = document.getElementById("matchID") as HTMLSelectElement;
  let listVal: number = +list.value;
  if (listVal == null || isNaN(listVal)) return;
  if (listVal >= 0) window.location.href = "/play?id=" + listVal;
}
