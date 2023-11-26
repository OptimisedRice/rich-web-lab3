const {fromEvent} = rxjs;

//const deleteEvent = new Event("delete");
// Create the event.
const deleteEvent = document.createEvent("Event");

// Define that the event name is 'build'.
deleteEvent.initEvent("delete", true, true);
window.onload= () => {
    let noteForm = document.getElementById("note_form");
    //noteForm.addEventListener("submit", addNote)
    const submitSubscription =
      fromEvent(noteForm, 'submit').subscribe(addNote);
}

let counter = 0;
const addNote = (event) => {
    event.preventDefault();

    let noteCon = document.getElementById("note_container")
    //get input
    let noteInput = event.target.querySelector("input[name='note_text']");
    let noteText = noteInput.value;

    //get parent
    let parentSelection = event.target.querySelector("select[name='parent']");
    let parentNote = parentSelection.value;
    //clear input
    noteInput.value="";

    let note = document.createElement("custom-note");
    note.setAttribute("data-text", noteText)
    note.setAttribute("id", "note" + (counter + 1))
    note.setAttribute("note-number", (counter + 1))
    let parentNoteElement = document.getElementById("note" + parentNote)
    if (parentNoteElement) {
        note.parentNote = parentNoteElement;
    }
    //add note element to the note container
    noteCon.appendChild(note);

    let option = document.createElement("option");
    option.setAttribute("value", counter + 1);
    option.setAttribute("id", "option" + (counter + 1))
    option.appendChild(document.createTextNode(counter + 1))

    parentSelection.appendChild(option);
    counter++;
}

// const editNote = (event) => {
//     let editButton = event.target;
//     console.log(event);
//     let noteText = event.target.previousElementSibling; //get reference to note text
//
//     let confirmButton = document.createElement("button");
//     confirmButton.appendChild(document.createTextNode("Confirm"));
//     confirmButton.setAttribute("class", "editButton");
//
//     const confirmClickSubscription =
//       fromEvent(confirmButton, 'click').subscribe(confirmNote);
//     //change button
//     editButton.replaceWith(confirmButton);
//
//     let noteInput = document.createElement("textarea"); //create textarea element
//     noteInput.appendChild(document.createTextNode(noteText.firstChild.nodeValue)); //insert existing text
//     noteText.replaceWith(noteInput); //replace element
// }
//
// const confirmNote = (event) => {
//     let confirmButton = event.target;
//     let noteInput = event.target.previousElementSibling; //get textarea reference
//
//     let editButton = document.createElement("button");
//     editButton.appendChild(document.createTextNode("Edit"));
//     editButton.setAttribute("class", "editButton");
//     const editClickSubscription =
//       fromEvent(editButton, 'click').subscribe(editNote);
//     //change button
//     confirmButton.replaceWith(editButton);
//
//     let noteContent = document.createElement("p"); //create paragraph element
//     noteContent.setAttribute("class","note_content"); //assign class
//     noteContent.appendChild(document.createTextNode(noteInput.value)); //insert existing text
//     noteInput.replaceWith(noteContent); //replace element
// }
//
// const delNote = (event) => {
//     event.target.parentElement.remove(); //remove element from DOM
// }

class CustomNote extends HTMLElement {
    constructor() {
        super();

        this._parentNote = null;
    }

    set parentNote(value) {
        this._parentNote = value;
    }

    get parentNote() {
        return this._parentNote;
    }

    editNote(event) {
        let editButton = event.target;
        console.log(event);
        let noteText = event.target.parentElement.previousElementSibling; //get reference to note text

        let confirmButton = document.createElement("button");
        confirmButton.appendChild(document.createTextNode("Confirm"));
        confirmButton.setAttribute("class", "editButton");
        const confirmClickSubscription =
          fromEvent(confirmButton, 'click').subscribe(e => this.confirmNote(e));
        //change button
        editButton.replaceWith(confirmButton);

        let noteInput = document.createElement("textarea"); //create textarea element
        noteInput.appendChild(document.createTextNode(noteText.firstChild.nodeValue)); //insert existing text
        noteText.replaceWith(noteInput); //replace element
    }


    confirmNote(event) {
        let confirmButton = event.target;
        let noteInput = event.target.parentElement.previousElementSibling; //get textarea reference

        let editButton = document.createElement("button");
        editButton.appendChild(document.createTextNode("Edit"));
        editButton.setAttribute("class", "editButton");
        const editClickSubscription =
          fromEvent(editButton, 'click').subscribe(e => this.editNote(e));
        //change button
        confirmButton.replaceWith(editButton);

        let noteContent = document.createElement("p"); //create paragraph element
        noteContent.setAttribute("class","note_content"); //assign class
        noteContent.appendChild(document.createTextNode(noteInput.value)); //insert existing text
        noteInput.replaceWith(noteContent); //replace element
    }

    delNote(event) {
        let id = this.getAttribute("note-number")
        let option = document.getElementById("option" + id);
        if(option) {
            option.remove();
        }
        //console.log(option.getAttribute("id"))
        console.log(id);
        this.dispatchEvent(new Event("delete"));
        this.remove(); //remove element from DOM
    }

    connectedCallback() {
        //create note div
        let note = document.createElement("div");
        note.setAttribute("class", "note");

        let noteCon = document.getElementById("note_container")

        //assign random color to note
        const randomColor = Math.floor(Math.random()*16777215).toString(16);
        note.style.background = "#" + randomColor;

        //add title
        let title = document.createElement("h3");
        title.style.margin = "0";
        title.style.color = "white";

        //number of notes as note id
        title.appendChild(document.createTextNode("Note " + (counter + 1))); //add string text to the p element
        note.appendChild(title); //add heading element to div

        //create paragraph element
        let content = document.createElement("p");
        content.setAttribute("class","note_content");

        //get note input from attribute
        const noteText = this.getAttribute("data-text");

        let text = document.createTextNode(noteText);
        content.appendChild(text); //add string text to the p element
        note.appendChild(content); //add p element to div

        //wrap both buttons into one div
        let div = document.createElement("div");
        div.style.display = "flex";
        //create editButton element and add listener
        let editButton = document.createElement("button");
        editButton.appendChild(document.createTextNode("Edit"));
        editButton.setAttribute("class", "editButton");

        //editButton.addEventListener("click", editNote);
        const editClickSubscription =
          fromEvent(editButton, 'click').subscribe(e => this.editNote(e));
        div.appendChild(editButton);

        //create deleteButton element and add listener
        let delButton = document.createElement("button");
        delButton.appendChild(document.createTextNode("Delete"));
        delButton.setAttribute("class", "delButton");

        //delButton.addEventListener("click", delNote);
        const deleteClickSubscription =
          fromEvent(delButton, 'click').subscribe(e => this.delNote(e));

        div.appendChild(delButton);

        note.appendChild(div);

        this.appendChild(note);

        //add subscription to delete event of parent note
        //let parent = this.getAttribute("parent");
        if(this.parentNote != null) {
            const deleteParentSubscription =
              fromEvent(this.parentNote, 'delete').subscribe(e => this.delNote(e));
        }
    }

    disconnectedCallback() {
    }
}

window.customElements.define('custom-note', CustomNote);


