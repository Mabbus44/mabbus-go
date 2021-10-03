export function setSelect(val: number): void {
  const list1 = document.getElementById('challengerName') as HTMLSelectElement;
  const list2 = document.getElementById('challengerID') as HTMLSelectElement;
  list1.selectedIndex = val;
  list2.selectedIndex = val;
}

export function setSelect2(val: number): void {
  const list1 = document.getElementById('oponentName') as HTMLSelectElement;
  const list2 = document.getElementById('matchId') as HTMLSelectElement;
  list1.selectedIndex = val;
  list2.selectedIndex = val;
}

export function btnGoToGame(): void {
  const list = document.getElementById('matchId') as HTMLSelectElement;
  const listVal: number = +list.value;
  if (listVal == null || isNaN(listVal)) return;
  if (listVal >= 0) window.location.href = `/play?id=${listVal}`;
}
