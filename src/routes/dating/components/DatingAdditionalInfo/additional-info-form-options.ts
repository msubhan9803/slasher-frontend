import { generateRange } from '../../../../utils/array-utils';
import { inchesToCentimeters, inchesToFeetInchString } from '../../../../utils/measurement-utils';

export const interestsList = [
  'Art',
  'Board games',
  'Books',
  'Cooking',
  'Movies',
  'Music',
  'Outdoors',
  'Sports',
  'Video games',
  'Writing',
];

export const heightOptions = (() => {
  // 48 inches = 4 feet
  const lowerBound = 48;
  // 84 inches = 7 feet
  const upperBound = 84;

  const opts = generateRange(lowerBound, upperBound).map(
    (inches) => ({
      label: `${inchesToFeetInchString(inches)} / ${inchesToCentimeters(inches)} cm`,
      value: `${inches}`,
    }),
  );

  opts.unshift({
    label: `Under ${inchesToFeetInchString(lowerBound)} / ${inchesToCentimeters(lowerBound)} cm`,
    value: `${lowerBound - 1}`,
  });

  opts.push({
    label: `Over ${inchesToFeetInchString(upperBound)} / ${inchesToCentimeters(upperBound)} cm`,
    value: `${upperBound + 1}`,
  });

  return opts;
})();

// Also, make first value "under 4 feet / cm" and last value "over 7 feet / cm".

export const relationshipStatusOptions = [
  { label: 'Single', value: 'single' },
  { label: 'Separated', value: 'separated' },
  { label: 'Divorced', value: 'divorced' },
  { label: 'Open relationship', value: 'openrelationship' },
  { label: 'Widowed', value: 'widowed' },
];

export const bodyTypeOptions = [
  { label: 'Thin', value: 'thin' },
  { label: 'Average', value: 'average' },
  { label: 'Fit / Muscular', value: 'fit/muscular' },
  { label: 'Few extra lbs', value: 'fewExtraLbs' },
  { label: 'Large', value: 'large' },
];

export const tatoosOptions = [
  { label: 'Some', value: 'some' },
  { label: 'A lot', value: 'lot' },
  { label: 'None', value: 'none' },
];

export const ethnicityOptions = [
  { label: 'African American / Black', value: 'African American / Black' },
  { label: 'Asian', value: 'Asian' },
  { label: 'Caucasian / White', value: 'Caucasian / White' },
  { label: 'Hispanic / Latin', value: 'Hispanic / Latin' },
  { label: 'Indian', value: 'Indian' },
  { label: 'Middle Eastern', value: 'Middle Eastern' },
  { label: 'Multiracial', value: 'Multiracial' },
  { label: 'Native American', value: 'Native American' },
  { label: 'Pacific Islander', value: 'Pacific Islander' },
  { label: 'Other', value: 'Other' },
];

export const parentalStatusOptions = [
  { label: 'Does not have children', value: 'noChildren' },
  { label: 'Has children', value: 'hasChildren' },
  { label: 'Has children, not living with me', value: 'hasChildrenNotLivingWithMe' },
];

export const wantsChildrenOptions = [
  { label: 'Yes', value: 'yes' },
  { label: 'Maybe', value: 'maybe' },
  { label: 'No', value: 'no' },
];

export const religionOptions = [
  { label: 'Anglican', value: 'Anglican' },
  { label: 'Agnostic', value: 'Agnostic' },
  { label: 'Atheist', value: 'Atheist' },
  { label: 'Baptist', value: 'Baptist' },
  { label: 'Buddhist', value: 'Buddhist' },
  { label: 'Catholic', value: 'Catholic' },
  { label: 'Christian', value: 'Christian' },
  { label: 'Hindu', value: 'Hindu' },
  { label: 'Jewish', value: 'Jewish' },
  { label: 'Lutheran', value: 'Lutheran' },
  { label: 'Methodist', value: 'Methodist' },
  { label: 'Muslim', value: 'Muslim' },
  { label: 'New Age', value: 'New Age' },
  { label: 'Pagan', value: 'Pagan' },
];

export const educationLevelOptions = [
  { label: 'Primary / Grammar', value: 'primary/grammar' },
  { label: 'Secondary / High school', value: 'highSchool' },
  { label: 'Associate', value: 'associate' },
  { label: 'Bachelor', value: 'bachelor' },
  { label: 'Master’s / Graduate', value: 'master’s/graduate' },
  { label: 'Doctorate', value: 'doctorate' },
];

export const employmentOptions = [
  { label: 'Not employed', value: 'notEmployed' },
  { label: 'Part-time', value: 'fart-time' },
  { label: 'Full-time', value: 'full-time' },
  { label: 'Self employed', value: 'selfEmployed' },
];

export const petOptions = [
  { label: 'Cat(s)', value: 'cat(s)' },
  { label: 'Dog(s)', value: 'dog(s)' },
  { label: 'Other', value: 'other' },
  { label: 'None', value: 'none' },
];

export const drinkingOptions = [
  { label: 'No', value: 'no' },
  { label: 'Rarely', value: 'rarely' },
  { label: 'Socially', value: 'socially' },
  { label: 'Often', value: 'often' },
];

export const smokingOptions = [
  { label: 'Non-smoker', value: 'non-smoker' },
  { label: 'Smoker', value: 'smoker' },
];

export const sexualOrientationOptions = [
  { label: 'Straight', value: 'straight' },
  { label: 'Gay', value: 'gay' },
  { label: 'Lesbian', value: 'lesbian' },
  { label: 'Bisexual', value: 'bisexual' },
  { label: 'Asexual', value: 'asexual' },
  { label: 'Demisexual', value: 'demisexual' },
  { label: 'Pansexual', value: 'pansexual' },
  { label: 'Queer', value: 'queer' },
  { label: 'Questioning', value: 'questioning' },
  { label: 'Prefer not to say', value: 'prefer-not-to-say' },
];
