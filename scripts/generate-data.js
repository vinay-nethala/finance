import { writeFileSync, mkdirSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const TOTAL_ROWS = 1_000_000;

const merchants = [
  'TechCorp', 'GlobalMart', 'FreshFoods', 'NetflixPay', 'AmazonPrime',
  'SpotifyHQ', 'AppleStore', 'GoogleCloud', 'MicrosoftAzure', 'DigitalOcean',
  'ShopifyPlus', 'StripeInc', 'PayPalDirect', 'SquarePOS', 'WalmartOnline',
  'TargetRetail', 'BestBuyElec', 'HomeDepotHW', 'CostcoWhole', 'TraderJoes',
  'WholeMarket', 'StarBucks', 'DunkinShop', 'UberRides', 'LyftRides',
  'AirbnbStay', 'BookingHotel', 'DeltaAir', 'UnitedFly', 'SouthwestAir',
  'HertzRental', 'AvisCarRent', 'ZoomVideo', 'SlackComms', 'NotionWork',
  'FigmaDesign', 'AdobeCloud', 'CanvaPro', 'GithubDev', 'AtlassianJira'
];

const categories = [
  'Technology', 'Groceries', 'Entertainment', 'Travel', 'Shopping',
  'Utilities', 'Healthcare', 'Education', 'Food & Dining', 'Transportation',
  'Subscription', 'Insurance', 'Investment', 'Salary', 'Freelance'
];

const statuses = ['Completed', 'Pending', 'Failed'];

const descriptions = [
  'Monthly subscription payment',
  'One-time purchase',
  'Recurring billing cycle',
  'Refund processed',
  'Wire transfer received',
  'Direct deposit payment',
  'Online marketplace order',
  'Service fee deduction',
  'Account top-up',
  'Commission payout',
  'Invoice settlement',
  'Platform usage fee',
  'Annual renewal charge',
  'Cashback reward credit',
  'Late payment penalty'
];

function seededRandom(seed) {
  let s = seed;
  return function () {
    s = (s * 1664525 + 1013904223) & 0xffffffff;
    return (s >>> 0) / 0xffffffff;
  };
}

function generateData() {
  console.log(`Generating ${TOTAL_ROWS.toLocaleString()} transaction records...`);
  const startTime = Date.now();
  const random = seededRandom(42);

  const startDate = new Date('2020-01-01').getTime();
  const endDate = new Date('2026-03-22').getTime();
  const dateRange = endDate - startDate;

  const chunks = [];
  chunks.push('[');

  for (let i = 0; i < TOTAL_ROWS; i++) {
    const date = new Date(startDate + random() * dateRange);
    const record = {
      id: i + 1,
      date: date.toISOString(),
      merchant: merchants[Math.floor(random() * merchants.length)],
      category: categories[Math.floor(random() * categories.length)],
      amount: parseFloat((random() * 9999.99 + 0.01).toFixed(2)),
      status: statuses[Math.floor(random() * statuses.length)],
      description: descriptions[Math.floor(random() * descriptions.length)]
    };

    if (i > 0) chunks.push(',');
    chunks.push(JSON.stringify(record));

    if ((i + 1) % 100000 === 0) {
      console.log(`  Generated ${(i + 1).toLocaleString()} records...`);
    }
  }

  chunks.push(']');

  const outputDir = join(__dirname, '..', 'public');
  if (!existsSync(outputDir)) {
    mkdirSync(outputDir, { recursive: true });
  }

  const outputPath = join(outputDir, 'transactions.json');
  console.log(`Writing to ${outputPath}...`);
  writeFileSync(outputPath, chunks.join(''));

  const elapsed = ((Date.now() - startTime) / 1000).toFixed(2);
  console.log(`Done! Generated ${TOTAL_ROWS.toLocaleString()} records in ${elapsed}s`);
}

generateData();
