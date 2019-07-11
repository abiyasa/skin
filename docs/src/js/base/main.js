const Modal = require('makeup-modal');
const transition = require("./transition");
const RovingTabindex = require('makeup-roving-tabindex');
const Expander = require('makeup-expander');
const FloatingLabel = require('makeup-floating-label');
const ScrollKeyPreventer = require('makeup-prevent-scroll-keys');
const ActiveDescendant = require('makeup-active-descendant');
const Listbox = require('./listbox.js');
const ListboxButton = require('./listbox-button.js');
const Menu = require('./menu.js');
const MenuButton = require('./menu-button.js');

// EXPAND BUTTON
// Potential candidate for makeup-expander, but expander currently requires a wrapper around the "host"
document.querySelectorAll('.expand-btn-example').forEach(function(el, i) {
    el.addEventListener('click', function(e) {
        const isExpanded = this.getAttribute('aria-expanded') === 'true';
        this.setAttribute('aria-expanded', !isExpanded);
    })
});

// FAKE MENU
document.querySelectorAll('.fake-menu').forEach(function(widgetEl) {
    const widget = new Expander(widgetEl, {
        alwaysDoFocusManagement: true,
        collapseOnFocusOut: true,
        collapseOnMouseOut: true,
        contentSelector: '.fake-menu__items',
        expandOnClick: true,
        focusManagement: 'focusable',
        hostSelector: '.expand-btn'
    });
});

// COMBOBOX
document.querySelectorAll('.combobox').forEach(function(widgetEl) {
    var expanderWidget = new Expander(widgetEl, {
        autoCollapse: true,
        contentSelector: '[role=listbox]',
        expandedClass: 'combobox--expanded',
        expandOnFocus: true,
        hostSelector: 'input'
    });

    const focusEl = widgetEl.querySelector('input');
    const ownedEl = widgetEl.querySelector('[role=listbox]');
    const listItems = ownedEl.querySelectorAll('[role=option]');

    focusEl.addEventListener('keydown', e => {
        // prevent caret move and page scroll
        if (e.keyCode === 38 || e.keyCode === 40) {
            e.preventDefault();
        }
    });

    const activeDescendantWidget = ActiveDescendant.createLinear(widgetEl, focusEl, ownedEl, '[role=option]', {
        activeDescendantClassName: 'combobox__option--active'
    });

    widgetEl.addEventListener('activeDescendantChange', e => {
        focusEl.value = listItems[e.detail.toIndex].innerText;
    });
});

// DIALOG
document.querySelectorAll('.dialog-button').forEach(function (btn) {
    let cancel;
    const dialog = btn.nextElementSibling;
    const dialogBody = dialog.querySelector('.dialog__body');
    const dialogClose = dialog.querySelector('.dialog__close');
    btn.addEventListener('click', handleOpen);

    function handleOpen () {
        if (cancel) {
            cancel();
        }

        cancel = transition(dialog, 'dialog--show', handleTransitionEnd(true));
        dialog.removeAttribute('hidden');
        btn.removeEventListener('click', handleOpen);
        dialog.addEventListener('click', handleClose, true);
        document.body.setAttribute("style", "overflow:hidden");
        Modal.modal(dialog.querySelector('.dialog__window'));
    }

    function handleClose (ev) {
        if (dialogBody.contains(ev.target)) {
            return;
        }

        if (cancel) {
            cancel();
        }

        cancel = transition(dialog, 'dialog--hide', handleTransitionEnd(false));
        dialog.setAttribute('hidden', '');
        btn.addEventListener('click', handleOpen);
        dialog.removeEventListener('click', handleClose, true);
        document.body.removeAttribute("style");
        Modal.unmodal();
        btn.focus();
    }

    function handleTransitionEnd (isOpening) {
        // focus on the close button
        if (isOpening) {
            // hack: safari needs an additional timeout
            window.setTimeout(function() {
                dialogClose.focus();
            }, 250);
        }

        cancel = undefined;
    }
});

// TOOLTIP
document.querySelectorAll('.tooltip').forEach(function(widgetEl) {
    const widget = new Expander(widgetEl, {
        contentSelector: '.tooltip__overlay',
        collapseOnFocusOut: true,
        collapseOnMouseOut: true,
        expandOnFocus: true,
        expandOnHover: true,
        focusManagement: 'focusable',
        hostSelector: '.tooltip__host'
    });
});

// INFOTIP
document.querySelectorAll('.infotip').forEach(function(widgetEl) {
    const widget = new Expander(widgetEl, {
        contentSelector: '.infotip__overlay',
        expandOnFocus: false,
        expandOnClick: true,
        hostSelector: '.infotip__host'
    });

    widgetEl.querySelector('.infotip__close').addEventListener('click', function() {
        widget.collapse();
    });
});

// TOURTIP
document.querySelectorAll('.tourtip').forEach(function(widgetEl) {
    widgetEl.querySelector('.tourtip__close').addEventListener('click', function() {
        widgetEl.classList.remove('tourtip--expanded');
    });
});

// FLOATING LABEL
document.querySelectorAll('.floating-label').forEach(function (el) {
    const floatingLabel = new FloatingLabel(el);
});

// TABS
document.querySelectorAll('.tabs').forEach(function(widgetEl) {
    const rovingTabindex = RovingTabindex.createLinear(widgetEl, '[role=tab]', { wrap: true });
    const tabItems = widgetEl.querySelectorAll('[role=tab]');
    const tabPanels = widgetEl.querySelectorAll('[role=tabpanel]');

    widgetEl.addEventListener('rovingTabindexChange', function(e) {
        tabItems[e.detail.fromIndex].setAttribute('aria-selected', 'false');
        tabItems[e.detail.toIndex].setAttribute('aria-selected', 'true');

        tabPanels[e.detail.fromIndex].hidden = true;
        tabPanels[e.detail.toIndex].hidden = false;
    });

    widgetEl.querySelectorAll('[role=tab]').forEach(function(el) {
        ScrollKeyPreventer.add(el);
    });
});

document.querySelectorAll('.listbox').forEach(function(widgetEl) {
    const widget = new Listbox(widgetEl, {
        autoSelect: (widgetEl.dataset.autoSelect === 'true') ? true : false
    });

    widgetEl.addEventListener('listbox-change', function(e) {
        console.log(e.type, e.detail);
    });
});

document.querySelectorAll('.listbox-button').forEach(function(widgetEl) {
    const widget = new ListboxButton(widgetEl, {
        labelSelector: '.expand-btn__text'
    });

    widgetEl.addEventListener('listbox-button-change', function(e) {
        console.log(e.type, e.detail);
    });
});

document.querySelectorAll('.menu:not(.menu--no-button)').forEach(function(widgetEl) {
    const widget = new MenuButton(widgetEl, {
        expandedClass: '.menu--expanded',
        menuSelector: '.menu__items'
    });

    widget.menu.el.addEventListener('menu-select', function(e) {
        console.log(e.type, e.detail);
    });

    widget.menu.el.addEventListener('menu-change', function(e) {
        console.log(e.type, e.detail);
    });

    widget.menu.el.addEventListener('menu-toggle', function(e) {
        console.log(e.type, e.detail);
    });
});

document.querySelectorAll('.menu--no-button').forEach(function(widgetEl) {
    const widget = new Menu(widgetEl);

    widgetEl.addEventListener('menu-select', function(e) {
        console.log(e.type, e.detail);
    });

    widgetEl.addEventListener('menu-change', function(e) {
        console.log(e.type, e.detail);
    });

    widgetEl.addEventListener('menu-toggle', function(e) {
        console.log(e.type, e.detail);
    });
});
