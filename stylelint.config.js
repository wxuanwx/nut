
module.exports = {
  extends: [
    'stylelint-config-standard-scss',
    'stylelint-config-prettier-scss'
  ],
  rules: {
    'scss/at-rule-no-unknown': true,
    'at-rule-no-unknown': null,
    'selector-class-pattern': null,
    'no-descending-specificity': null
  }
};
