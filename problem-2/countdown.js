const {fromEvent, Observable, filter, Subject} = rxjs;

window.onload = () => {
  let timeForm = document.getElementById("input");

  const submitSubscription =
    fromEvent(timeForm, 'submit').subscribe(setCountdown);
}

let secondsSubject = new Subject();
let secondsGlobal = 0;

let minutesSubject = new Subject();
let minutesGlobal = 0;

//let hoursSubject = new Subject<number>();
let hoursGlobal = 0;
//const secondObservable = new Observable(secondsGlobal).pipe(filter(second => second === 0));
let secondSubscription = secondsSubject.subscribe();

//const minuteObservable = new Observable(minutesGlobal).pipe(filter(minute => minute === 0));
let minuteSubscription = minutesSubject.subscribe();

let countdownInterval;
const setCountdown = (event) => {

  event.preventDefault();

  let hoursInput = Number(event.target.querySelector("input[name='hours']").value);
  let minutesInput = Number(event.target.querySelector("input[name='minutes']").value);
  let secondsInput = Number(event.target.querySelector("input[name='seconds']").value);

  if (secondsInput >= 60) {
    let extra = Math.floor(secondsInput / 60);
    minutesInput += extra;

    secondsInput = secondsInput - (60 * extra);
  }

  if (minutesInput >= 60) {
    let extra = Math.floor(minutesInput / 60);
    hoursInput += extra;

    minutesInput = minutesInput - (60 * extra);
  }

  secondsGlobal = secondsInput;
  minutesGlobal = minutesInput;
  hoursGlobal = hoursInput;

  secondSubscription.unsubscribe();
  secondSubscription = secondsSubject.pipe(filter(second => second === 0)).subscribe(decrementMinutes);

  minuteSubscription.unsubscribe();
  minuteSubscription = minutesSubject.pipe(filter(minute => minute === 0)).subscribe(decrementHours);

  updateOutput();

  if(countdownInterval){
    clearInterval(countdownInterval)
  }
  countdownInterval = setInterval(decrementSeconds, 1000);

}

const decrementSeconds = () => {
  if(secondsGlobal === 0 && minutesGlobal === 0 && hoursGlobal === 0) {
    minuteSubscription.unsubscribe();
    secondSubscription.unsubscribe();
    return clearInterval(countdownInterval);
  }

  if(secondsGlobal !== 0) {
    secondsGlobal--;
  }
  secondsSubject.next(secondsGlobal);
  updateOutput();
}

const decrementMinutes = (test) => {

  if(minutesGlobal === 0) {

    return minutesSubject.next(0);
  }

  minutesGlobal--;
  secondsGlobal = 59;
  minutesSubject.next(minutesGlobal);
  updateOutput();
}

const decrementHours = () => {
  if(hoursGlobal === 0) {
    return;
  }
  hoursGlobal--;
  minutesGlobal = 59;
  updateOutput();
}

const updateOutput = () => {
  let timer = "";

  timer = hoursGlobal > 0 ? hoursGlobal + ":" : "";

  if (minutesGlobal > 0 || hoursGlobal > 0) {
    timer += (minutesGlobal < 10 ? "0" : "") + minutesGlobal + ":";
    timer += (secondsGlobal < 10 ? "0" : "") + secondsGlobal;
  } else {
    timer += (secondsGlobal < 10 ? "0": "") + secondsGlobal;
  }

  let output = document.querySelector(".output");
  output.innerHTML = "";
  output.appendChild(document.createTextNode(timer));

  console.log(timer);
}