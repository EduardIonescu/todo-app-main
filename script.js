const form = document.querySelector("form");
const formCheckbox = document.querySelector("input#checkbox-new-todo");
const textInput = document.querySelector("input#text-new-todo");
const sectionTodos = document.querySelector("ul.bottom");

const itemsLeft = document.querySelector(".number-items-left");

const buttonAll = document.querySelector(".button-all");
const buttonActive = document.querySelector(".button-active");
const buttonCompleted = document.querySelector(".button-completed");

const buttonClearCompleted = document.querySelector(".button-clear-completed");

const buttonsNavbar = document.querySelectorAll(
	".container-buttons-middle button"
);

// Submit on checkbox click
formCheckbox.addEventListener("click", () => {
	formValidation();
});
form.addEventListener("submit", (e) => {
	e.preventDefault();
	formValidation();
});

function formValidation() {
	if (textInput.value === "") {
		console.log("failure");
	} else {
		console.log("success");
		acceptData();
	}
}
console.log(localStorage.getItem("data"));
let data = [];

// On first load / when refreshed with no items,
// the data takes the value of defaultData

const defaultData = [
	{ text: "Complete online JavaScript course", isChecked: true },
	{ text: "Jog around the park 3x", isChecked: false },
	{ text: "10 minutes meditation", isChecked: false },
	{ text: "Read for 1 hour", isChecked: false },
	{ text: "Pick up groceries", isChecked: false },
	{ text: "Complete Todo App on Frontend Mentor", isChecked: false },
];
(() => {
	data = JSON.parse(localStorage.getItem("data")) || [];

	if (data.length == 0) {
		data = defaultData;
	} else {
	}
	console.log(data);
	showTodos();
})();

// Accepts input data
function acceptData() {
	data.push({
		text: textInput.value,
		isChecked: false,
	});

	console.log(data);
	showTodos();
}

// Recreates the Todos list on new input
function showTodos(selectedData = data) {
	sectionTodos.innerHTML = "";

	selectedData.map((d, i) => {
		return (sectionTodos.innerHTML += `
			<li class="container-item" draggable="true" id=${i}>
				<input 
					type="checkbox" 
					name="" 
					class="checkbox"
					${d.isChecked ? "checked" : ""} />
				<p class="text-output ${d.isChecked ? "line-through" : ""}">
					${d.text}
				</p>

				<button class="button-delete hidden">
					<img src="/images/icon-cross.svg" alt="delete button" />
				</button>
			</li>

			`);
	});
	localStorage.setItem("data", JSON.stringify(data));
	showItemsLeft();
	createFunctionality();
	resetForm();
}

function resetForm() {
	textInput.value = "";
}

// Button checked + delete button
function createFunctionality() {
	const checkboxes = document.querySelectorAll("ul.bottom .checkbox");
	const listItems = document.querySelectorAll("li.container-item");
	const deleteButtons = document.querySelectorAll(".button-delete");

	checkboxes.forEach((checkbox, index) => {
		checkbox.addEventListener("click", () => {
			checkbox.toggleAttribute("checked");
			data[index].isChecked = !data[index].isChecked;
			console.log(data[index].isChecked);

			showTodos();
		});
	});

	// Show delete button on hover
	listItems.forEach((li, index) => {
		const deleteButton = deleteButtons[index];

		li.addEventListener("mouseenter", () => {
			if (deleteButton.classList.contains("hidden")) {
				deleteButton.classList.remove("hidden");
			}
		});
		li.addEventListener("mouseleave", () => {
			deleteButton.classList.add("hidden");
		});
	});

	deleteButtons.forEach((deleteButton) => {
		deleteButton.addEventListener("click", deleteTask);
	});

	// DRAG & DROP
	listItems.forEach((draggable) => {
		draggable.addEventListener("dragstart", () =>
			draggable.classList.add("dragging")
		);
		draggable.addEventListener("touchstart", () =>
			draggable.classList.add("dragging")
		);

		draggable.addEventListener("dragend", dragend);
		draggable.addEventListener("touchend", dragend);
	});

	function dragend() {
		this.classList.remove("dragging");
		const listItemsAfterMoving = document.querySelectorAll("li");

		// Reinitialize data with listItems after dragend
		data = [];
		listItemsAfterMoving.forEach((li) => {
			const text = li.querySelector("p.text-output").innerHTML;
			const isChecked = li
				.querySelector("input[type=checkbox]")
				.hasAttribute("checked");

			data.push({
				text,
				isChecked,
			});
		});

		showTodos();
		localStorage.setItem("data", JSON.stringify(data));
	}

	// Worth looking into debouncers for this one
	sectionTodos.addEventListener("dragover", (e) => {
		dragover(e);
	});
	sectionTodos.addEventListener("touchmove", (e) => {
		dragover(e);
	});

	function dragover(e) {
		e.preventDefault();
		// first one for Desktop, second one for Touchscreen
		const top = e.clientY || e.targetTouches[0].pageY;
		const afterElement = getDragAfterElement(sectionTodos, top);

		const draggable = document.querySelector(".dragging");
		if (afterElement == null) {
			sectionTodos.appendChild(draggable);
		} else {
			sectionTodos.insertBefore(draggable, afterElement);
		}
	}

	function getDragAfterElement(container, y) {
		const draggableElements = [
			...container.querySelectorAll("li:not(.dragging)"),
		];

		return draggableElements.reduce(
			(closest, child) => {
				const box = child.getBoundingClientRect();
				const offset = y - box.top - box.height / 2;

				if (offset < 0 && offset > closest.offset) {
					return { offset: offset, element: child };
				} else {
					return closest;
				}
			},
			{
				offset: Number.NEGATIVE_INFINITY,
			}
		).element;
	}
}

function deleteTask() {
	liParent = this.parentElement;
	data.splice(liParent.id, 1);
	liParent.remove();

	showTodos();
}

function showItemsLeft() {
	const uncheckedTodos = getTodos();
	if (!uncheckedTodos) {
		itemsLeft.textContent = "0";
	} else {
		itemsLeft.textContent = uncheckedTodos.length;
	}
}

buttonAll.addEventListener("click", () => showTodos(data));

buttonActive.addEventListener("click", () => {
	const uncheckedTodos = getTodos();
	showTodos(uncheckedTodos);
});

buttonCompleted.addEventListener("click", () => {
	const checkedTodos = getTodos((checked = false));
	showTodos(checkedTodos);
});

buttonClearCompleted.addEventListener("click", () => {
	const uncheckedTodos = getTodos();
	data = [...uncheckedTodos];
	showTodos();
});

buttonsNavbar.forEach((button) => {
	button.addEventListener("click", () => {
		buttonsNavbar.forEach((btn) => {
			if (btn.classList.contains("focused")) {
				btn.classList.remove("focused");
			}
		});
		button.classList.add("focused");
	});
});

// Get checked todos when true / unchecked todos when false
function getTodos(checked = true) {
	return data.filter((d) => d.isChecked != checked);
}

// Light & Dark mode switch
let windowWidth = window.innerWidth;
window.addEventListener("resize", () => (windowWidth = window.innerWidth));

const sun = document.querySelector(".sun");
const moon = document.querySelector(".moon");
const lightSwitch = document.querySelector(".light-switch");
const imageBG = document.querySelector(".image-bg");
const imageBGMobile = document.querySelector(".image-bg-mobile");

lightSwitch.addEventListener("click", () => {
	sun.classList.toggle("animate-sun");
	moon.classList.toggle("animate-moon");

	const currentTheme = document.documentElement.getAttribute("data-theme");

	const switchToTheme = currentTheme === "dark" ? "light" : "dark";

	// Change background image
	imageBGMobile.setAttribute(
		"srcset",
		`./images/bg-mobile-${switchToTheme}.jpg`
	);

	imageBG.setAttribute("src", `./images/bg-desktop-${switchToTheme}.jpg`);

	document.documentElement.setAttribute("data-theme", switchToTheme);
});

// Use something like this for edit on touble click

/*
document.querySelectorAll("li").forEach(function (node) {
	node.ondblclick = function () {
		var val = this.innerHTML;
		var input = document.createElement("input");
		input.value = val;
		input.onblur = function () {
			var val = this.value;
			this.parentNode.innerHTML = val;
		};
		this.innerHTML = "";
		this.appendChild(input);
		input.focus();
	};
});
*/
