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

	if (state.all) {
		data.map((d, i) => {
			createListItems(d);
		});
	} else if (state.active) {
		const uncheckedTodoList = getTodos();
		uncheckedTodoList.map((d, i) => {
			createListItems(d);
		});
	} else {
		const checkedTodoList = getTodos((checked = false));
		checkedTodoList.map((d, i) => {
			createListItems(d);
		});
	}

	function createListItems(d) {
		return (sectionTodos.innerHTML += `
			<li class="container-item" draggable="true" id=${d.listID}>
				<input 
					type="checkbox" 
					name="" 
					class="checkbox"
					${d.isChecked ? "checked" : ""} />
				<input class="text-output text-new-todo ${d.isChecked ? "line-through" : ""}" 
						readonly
						type="text"
						maxlength=50
						value="${d.text}" />
					
				

				<button class="button-delete hidden">
					<img src="/images/icon-cross.svg" alt="delete button" />
				</button>
			</li>

			`);
	}

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

	Array.prototype.move = function (from, to) {
		this.splice(to, 0, this.splice(from, 1)[0]);
	};

	let afterElement;

	function dragend() {
		this.classList.remove("dragging");
		const listItemsAfterMoving = document.querySelectorAll("li");

		let indexTo;
		if (afterElement) {
			indexTo = data.findIndex((list) => list.listID == afterElement.id);
		} else {
			indexTo = data.length - 1;
		}

		const indexFrom = data.findIndex((list) => list.listID == this.id);

		if (indexFrom > indexTo || !afterElement) {
			data.move(indexFrom, indexTo);
		} else {
			data.move(indexFrom, indexTo - 1);
		}

		showTodos();
		localStorage.setItem("data", JSON.stringify(data));
	}

	// Worth looing into better debouncer for this one, but this still helps.
	function debounce(fn, delay) {
		var timer = null;
		return function () {
			var context = this,
				args = arguments;
			clearTimeout(timer);
			timer = setTimeout(function () {
				fn.apply(context, args);
			}, delay);
		};
	}

	sectionTodos.addEventListener(
		"dragover",
		debounce((e) => {
			dragover(e);
			// more than 3ms delay just makes it seem too laggy
		}, 3)
	);

	// Debouncer messes this one up, worth looking into in the future.
	sectionTodos.addEventListener("touchmove", (e) => {
		dragover(e);
	});

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
	showTodos();
});

buttonActive.addEventListener("click", () => {
	state.setState("active");
	showTodos();
});

buttonCompleted.addEventListener("click", () => {
	state.setState("completed");
	showTodos();
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

// Add 'edit' feature after refactoring + id for each list

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

			localStorage.setItem("data", JSON.stringify(data));
		};
	});
});

/*
document.querySelectorAll("li p.text-output").forEach((node) => {
	node.ondblclick = function () {
		let val = this.innerHTML;
		const input = document.createElement("input");
		input.classList.add("text-new-todo");
		input.classList.add("text");
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
