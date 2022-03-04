import WinningNumberView from '../../views/subViews/WinningNumberView.js';
import { ERROR_MESSAGE, SELECTOR } from '../../configs/contants.js';
import validator from '../../utils/validator.js';
import LottoModel from '../../models/LottoModel.js';

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

  resetInput() {
    this.winningNumberView.clearInputs();
  }

  setEventHandler() {
    this.winningNumberView.bindOnClickShowResultButton(
      this.didClickShowResultButton.bind(this)
    );
  }

  didClickShowResultButton({ winningNumbers, bonusNumber }) {
    try {
      this.checkLottoList();
      validator.checkWinningNumberList(winningNumbers);
      validator.checkBonusNumber(bonusNumber);
      validator.checkDuplicateBonus(winningNumbers, bonusNumber);
      this.setWinningStatistic(winningNumbers, bonusNumber);
    } catch (error) {
      alert(error.message);
    }
  }

  checkLottoList() {
    const { lottoList } = this.lottoModel.getState();
    if (lottoList.length === 0) {
      throw new Error(ERROR_MESSAGE.DID_NOT_BUY_LOTTO);
    }
  }

  setWinningStatistic(winningNumbers, bonusNumber) {
    const { lottoList } = this.lottoModel.getState();
    const lottoNumbersList = lottoList.map((lotto) => lotto.numbers);
    const countList = this.createCountList(
      lottoNumbersList,
      winningNumbers,
      bonusNumber
    );
    const winningStatistic = this.createStatisticWithCountList(countList);

    this.lottoModel.setState({ winningStatistic });
    this.lottoController.afterSetWinningStatistic();
  }

  createCountList(lottoNumbersList, winningNumbers, bonus) {
    const countList = lottoNumbersList.map((lottoNumbers) =>
      this.countSameNumber(lottoNumbers, winningNumbers, bonus)
    );

    return countList;
  }

  countSameNumber(lottoNumbers, winningNumbers, bonus) {
    let Count = winningNumbers.filter(
      (winningNumber, index) => winningNumber === lottoNumbers[index]
    ).length;

    if (this.checkBonus(Count, lottoNumbers, bonus)) {
      Count += 0.5;
    }

    return Count;
  }

  checkBonus(count, lottoNumbers, bonus) {
    return lottoNumbers.find((number) => number === bonus) && count === 5;
  }

  createStatisticWithCountList(CountList) {
    const winningStatistic = LottoModel.createWinningStatistic();

    CountList.forEach((count) => {
      const countString = this.translateToString(count);
      winningStatistic[countString] += 1;
    });

    return winningStatistic;
  }

  translateToString(count) {
    switch (count) {
      case 3:
        return 'three';
      case 4:
        return 'four';
      case 5:
        return 'five';
      case 5.5:
        return 'fiveBonus';
      case 6:
        return 'six';
      default:
        return 'under';
    }
  }
}
