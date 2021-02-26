import { LOTTO } from '../utils/constants.js';
import { $, clearInputValue } from '../utils/dom.js';
import { ERROR_MESSAGE } from '../utils/message.js';
import { createLottos, updatePayment } from '../redux/action.js';
import { store } from '../index.js';
import Component from '../core/Component.js';
import Button from './Button/Button.js';
import Input from './Input/Input.js';

export default class LottoPurchaseInput extends Component {
  initRender() {
    this.$target.innerHTML = `
    <div class="d-flex flex-col">
      <div class="d-flex justify-between items-center">
        <label class="mb-2 d-inline-block">구입할 금액을 입력해주세요.
        </label>
        <div class="flex-auto d-flex justify-end pr-1 mb-2">
          <label class="switch">
            ${new Input({
              type: 'checkbox',
              classes: ['manual-input-toggle-button'],
            }).getTemplate()}
            <span class="text-base font-normal">수동구매</span>
          </label>
        </div>
      </div>
      <div class="d-flex">
        ${new Input({
          id: 'lotto-purchase-input',
          classes: ['w-100', 'mr-2', 'pl-2'],
          type: 'number',
          placeholder: '구입 금액',
        }).getTemplate()}
        ${new Button({
          id: 'lotto-purchase-btn',
          type: 'button',
          classes: ['btn', 'btn-cyan'],
          disabled: true,
          text: '확인',
        }).getTemplate()}
      </div>
    </div>
    <p data-section="purchaseInputMessage" class="text-xs text-center"></p>
    `;
  }

  setup() {
    store.subscribe(this.render.bind(this));
  }

  selectDOM() {
    this.$lottoPurchaseInputContainer = $('#lotto-purchase-input-container');
    this.$purchaseInput = $('#lotto-purchase-input');
    this.$purchaseButton = $('#lotto-purchase-btn');
    this.$purchaseInputMessage = $('[data-section=purchaseInputMessage]');
    this.$manualInputToggleButton = $('.manual-input-toggle-button');
  }

  bindEvent() {
    this.$purchaseInput.addEventListener(
      'keyup',
      this.onChangeInput.bind(this),
    );
    this.$purchaseButton.addEventListener('click', this.onSubmit.bind(this));
    this.$lottoPurchaseInputContainer.addEventListener(
      'submit',
      this.onSubmit.bind(this),
    );
  }

  onSubmit(e) {
    e.preventDefault();
    if (this.$purchaseButton.disabled) return;
    const payment = Number(this.$purchaseInput.value);
    store.dispatch(updatePayment(payment));
    if (this.$manualInputToggleButton.checked) {
      console.log(this.$manualInputToggleButton.checked);
      return;
    }
    store.dispatch(createLottos(payment));
  }

  onChangeInput(e) {
    const [text, result] = this.validatePurchaseInputValue(e.target.value);
    this.$purchaseInputMessage.textContent = text;
    if (result === 'success') {
      this.$purchaseInputMessage.style.color = 'green';
      this.$purchaseButton.disabled = false;
    } else if (result === 'error') {
      this.$purchaseInputMessage.style.color = 'red';
      this.$purchaseButton.disabled = true;
    }
  }

  validatePurchaseInputValue = number => {
    const payment = Number(number);
    if (!Number.isInteger(payment)) {
      return [ERROR_MESSAGE.NOT_INTEGER_NUMBER, 'error'];
    }

    if (payment < LOTTO.PRICE) {
      return [ERROR_MESSAGE.PAYMENT_AMOUNT, 'error'];
    }

    return [ERROR_MESSAGE.VALID_INPUT_NUMBER, 'success'];
  };

  clearView() {
    clearInputValue(this.$purchaseInput);
    this.$purchaseInput.disabled = false;
    this.$purchaseButton.disabled = true;
    this.$purchaseInputMessage.textContent = '';
    return;
  }

  disableInputArea() {
    this.$purchaseInput.disabled = true;
    this.$purchaseButton.disabled = true;
    this.$purchaseInputMessage.textContent = '';
  }

  render(prevStates, states) {
    if (states.payment === 0) {
      this.clearView();
      return;
    }

    if (prevStates.payment !== states.payment) {
      this.disableInputArea();
    }
  }
}
