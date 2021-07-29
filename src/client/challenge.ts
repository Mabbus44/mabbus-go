export function setSelect(val) {
  let list1 = document.getElementById("challengedName") as HTMLSelectElement;
  let list2 = document.getElementById("challengedID") as HTMLSelectElement;
  list1.selectedIndex = val;
  list2.selectedIndex = val;
}

export function setSelect2(val) {
  let list1 = document.getElementById("alreadyChallenged") as HTMLSelectElement;
  let list2 = document.getElementById("alreadyChallengedID") as HTMLSelectElement;
  list1.selectedIndex = val;
  list2.selectedIndex = val;
}
