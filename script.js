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

const state = {
	all: true,
	active: false,
	completed: false,

	setState: function (stateName) {
		const keys = Object.keys(this);
		keys.pop();
		for (const key of keys) {
			this[key] = false;
		}
		this[stateName] = true;
		showTodos();
	},
};

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
	} else {
		// Might be worth looking into uuid v4 to get unique IDs, but for now this works
		let randomID = Math.floor(10 ** 12 * Math.random());
		randomID = "id" + randomID;

		acceptData(randomID);
	}
}

let data = [];

// On first load / when refreshed with no items,
// the data takes the value of defaultData
const defaultData = [
	{
		listID: "id1111",
		text: "Complete online JavaScript course",
		isChecked: true,
	},
	{
		listID: "id1777711211",
		text: "Jog around the park 3x",
		isChecked: false,
	},
	{
		listID: "id152142142145551",
		text: "10 minutes meditation",
		isChecked: false,
	},
	{
		listID: "id123178888234144441",
		text: "Read for 1 hour",
		isChecked: false,
	},
	{
		listID: "id3321313213123133",
		text: "Pick up groceries",
		isChecked: false,
	},
	{
		listID: "id2222",
		text: "Complete Todo App on Frontend Mentor",
		isChecked: false,
	},
];
(() => {
	data = JSON.parse(localStorage.getItem("data")) || [];

	if (data.length == 0) {
		data = defaultData;
	} else {
	}
	showTodos();
})();

// Accepts input data
function acceptData(listID) {
	data.push({
		listID,
		text: textInput.value,
		isChecked: false,
	});

	showTodos();
}

// Recreates the Todos list on new input
function showTodos() {
	sectionTodos.innerHTML = "";

	// Filter the list based on state
	if (state.all) {
		data.map((dataItem) => {
			createListItems(dataItem);
		});
	} else if (state.active) {
		const uncheckedTodoList = getTodos();
		uncheckedTodoList.map((dataItem) => {
			createListItems(dataItem);
		});
	} else {
		const checkedTodoList = getTodos((checked = false));
		checkedTodoList.map((dataItem) => {
			createListItems(dataItem);
		});
	}

	function createListItems(dataItem) {
		return (sectionTodos.innerHTML += `
			<li class="container-item" draggable="true" id=${dataItem.listID}>
				<input 
					type="checkbox"  
					class="checkbox"
					aria-label="check-list-item"
					${dataItem.isChecked ? "checked" : ""} />
				<input class="text-output text-new-todo ${
					dataItem.isChecked ? "line-through" : ""
				}" 
						readonly
						type="text"
						aria-label="list-item"
						maxlength=50
						value="${dataItem.text}" />

				<button class="button-delete hidden" aria-label="Delete List Item">
					<img src="./images/icon-cross.svg" alt="delete button" />
				</button>
			</li>

			`);
	}

	setLocalStorageData();
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

			//const indexFrom = data.findIndex((list) => list.listID == this.id);
			data[index].isChecked = !data[index].isChecked;

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

	function deleteTask() {
		liParent = this.parentElement;

		const index = data.findIndex((list) => list.listID == liParent.id);

		data.splice(index, 1);
		liParent.remove();

		showTodos();
	}

	// Drag and Drop + Touch Functionality
	dragAndDrop(listItems);
}

function dragAndDrop(listItems) {
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

	Array.prototype.move = function (from, to) {
		this.splice(to, 0, this.splice(from, 1)[0]);
	};

	let afterElement = null;

	function dragend() {
		this.classList.remove("dragging");
		const listItemsAfterMoving = document.querySelectorAll("li");

		let indexTo;
		if (afterElement) {
			indexTo = data.findIndex((list) => list.listID == afterElement.id);
		} else if (afterElement === undefined) {
			indexTo = data.length - 1;
		}
		// touch event triggers even on simple click and this skips it.
		else {
			return;
		}

		const indexFrom = data.findIndex((list) => list.listID == this.id);

		if (indexFrom > indexTo || !afterElement) {
			data.move(indexFrom, indexTo);
		} else {
			data.move(indexFrom, indexTo - 1);
		}

		showTodos();
		setLocalStorageData();
	}

	// Worth looing into better debouncer for this one, but this still helps.
	function debounce(func, wait, immediate) {
		var timeout;
		return function () {
			var context = this,
				args = arguments;
			var later = function () {
				timeout = null;
				if (!immediate) func.apply(context, args);
			};
			var callNow = immediate && !timeout;
			clearTimeout(timeout);
			timeout = setTimeout(later, wait);
			if (callNow) func.apply(context, args);
		};
	}

	// No debouncer on Desktop because it sets the cursor to 'not allowed'
	// Haven't found solution for it
	sectionTodos.addEventListener("dragover", dragover);

	// more than 3ms delay just makes it seem too laggy
	const debouncedDragover = debounce(dragover, 3);
	sectionTodos.addEventListener("touchmove", debouncedDragover);

	function dragover(e) {
		e.preventDefault();
		// first one for Desktop, second one for Touchscreen
		const top = e.clientY || e.targetTouches[0].clientY;
		afterElement = getDragAfterElement(sectionTodos, top);

		const draggable = document.querySelector(".dragging");
		if (!afterElement) {
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

function showItemsLeft() {
	const uncheckedTodos = getTodos();
	if (!uncheckedTodos) {
		itemsLeft.textContent = "0";
	} else {
		itemsLeft.textContent = uncheckedTodos.length;
	}
}

buttonAll.addEventListener("click", () => {
	state.setState("all");
});

buttonActive.addEventListener("click", () => {
	state.setState("active");
});

buttonCompleted.addEventListener("click", () => {
	state.setState("completed");
});

buttonClearCompleted.addEventListener("click", () => {
	const uncheckedTodos = getTodos();
	data = [...uncheckedTodos];
	showTodos();
});

buttonsNavbar.forEach((button) => {
	button.addEventListener("click", () => {
		defocusButtons();
		focusButton(button);
	});
});

function defocusButtons() {
	buttonsNavbar.forEach((btn) => {
		if (btn.classList.contains("focused")) {
			btn.classList.remove("focused");
		}
	});
}
function focusButton(button) {
	button.classList.add("focused");
}

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

// Edit on double click but it's messy
document.querySelectorAll("li .text-output").forEach(function (node) {
	node.addEventListener("dblclick", function () {
		node.removeAttribute("readonly");
		node.style.cursor = "text";
		node.focus();

		node.addEventListener("keypress", function (e) {
			if (e.key === "Enter") {
				node.blur();
			}
		});
		node.onblur = function () {
			node.style.cursor = "pointer";
			node.setAttribute("readonly", "readonly");
			const nodeID = node.parentElement.id;

			data.map((d, i) => {
				if (d.listID == nodeID) {
					data[i].text = node.value;
				}
			});

			setLocalStorageData();
		};
	});
});

function setLocalStorageData() {
	localStorage.setItem("data", JSON.stringify(data));
}
