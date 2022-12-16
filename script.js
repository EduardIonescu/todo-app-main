const form = document.querySelector("form");
const formCheckbox = document.querySelector("input#checkbox-new-todo");
const textInput = document.querySelector("input#text-new-todo");
const sectionTodos = document.querySelector("section.bottom");

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

let data = [];

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
			<article class="container-item" draggable="true" id=${i}>
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
			</article>

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
	const checkboxes = document.querySelectorAll("section.bottom .checkbox");
	const articles = document.querySelectorAll("article.container-item");
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
	articles.forEach((article, index) => {
		const deleteButton = deleteButtons[index];

		article.addEventListener("mouseenter", () => {
			if (deleteButton.classList.contains("hidden")) {
				deleteButton.classList.remove("hidden");
			}
		});
		article.addEventListener("mouseleave", () => {
			deleteButton.classList.add("hidden");
		});
	});

	deleteButtons.forEach((deleteButton) => {
		deleteButton.addEventListener("click", deleteTask);
	});

	// DRAG & DROP
	articles.forEach((draggable) => {
		draggable.addEventListener("dragstart", () =>
			draggable.classList.add("dragging")
		);

		draggable.addEventListener("dragend", () => {
			draggable.classList.remove("dragging");
			const articlesAfterMoving = document.querySelectorAll("article");

			// Reinitialize data with articles after dragend
			data = [];
			articlesAfterMoving.forEach((article) => {
				const text = article.querySelector("p.text-output").innerHTML;
				const isChecked = article
					.querySelector("input[type=checkbox]")
					.hasAttribute("checked");

				data.push({
					text,
					isChecked,
				});
			});

			showTodos();
			localStorage.setItem("data", JSON.stringify(data));
		});
	});

	// Worth looking into debouncers for this one
	sectionTodos.addEventListener("dragover", (e) => {
		e.preventDefault();
		const afterElement = getDragAfterElement(sectionTodos, e.clientY);

		const draggable = document.querySelector(".dragging");
		if (afterElement == null) {
			sectionTodos.appendChild(draggable);
		} else {
			sectionTodos.insertBefore(draggable, afterElement);
		}
	});

	function getDragAfterElement(container, y) {
		const draggableElements = [
			...container.querySelectorAll("article:not(.dragging)"),
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
	articleParent = this.parentElement;
	data.splice(articleParent.id, 1);
	articleParent.remove();

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

(() => {
	data = JSON.parse(localStorage.getItem("data")) || [];
	console.log(data);
	showTodos();
})();
