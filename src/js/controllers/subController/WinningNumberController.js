import WinningNumberView from '../../views/subViews/WinningNumberView.js';
import { SELECTOR } from '../../configs/contants.js';
import validator from '../../utils/validator.js';

export default class WinningNumberController {
  init(controller) {
    this.lottoController = controller;
    this.lottoModel = controller.lottoModel;
    this.winningNumberView = new WinningNumberView(
      SELECTOR.WINNING_NUMBER_SECTION
    );
    this.winningNumberView.render();
    this.setEventHandler();
  }

  setEventHandler() {
    this.winningNumberView.bindOnClickShowResultButton(
      this.didClickShowResultButton.bind(this)
    );
  }

  didClickShowResultButton({ winningNumbers, bonusNumber }) {
    try {
      validator.checkWinningNumberList(winningNumbers);
      validator.checkBonusNumber(bonusNumber);
      this.calculateResult(winningNumbers, bonusNumber);
    } catch (error) {
      alert(error.message);
    }
  }

  resetInput() {
    this.winningNumberView.clearInputs();
  }

  calculateResult(winningNumbers, bonusNumber) {
    const { lottoList } = this.lottoModel.getState();
    const lottoNumbersList = lottoList.map((lotto) => lotto.numbers);
    const coincideCountList = this.createCoincideCountList(
      lottoNumbersList,
      winningNumbers,
      bonusNumber
    );

    this.lottoModel.setWinningStatistic(coincideCountList);
    this.lottoController.afterCalculateResult();
  }

  createCoincideCountList(lottoNumbersList, winningNumbers, bonus) {
    const countList = lottoNumbersList.map((lottoNumbers) =>
      this.countCoincide(lottoNumbers, winningNumbers, bonus)
    );

    return countList;
  }

  countCoincide(lottoNumbers, winningNumbers, bonus) {
    let coincideCount = winningNumbers.filter(
      (winningNumber, index) => winningNumber === lottoNumbers[index]
    ).length;

    if (this.checkBonus(coincideCount, lottoNumbers, bonus)) {
      coincideCount += 0.5;
    }

    return coincideCount;
  }

  checkBonus(count, lottoNumbers, bonus) {
    return lottoNumbers.find((number) => number === bonus) && count === 5;
  }
}
