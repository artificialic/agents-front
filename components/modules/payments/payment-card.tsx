import { ComponentPlaceholderIcon } from '@radix-ui/react-icons';

interface PaymentCardProps {
  publicData: {
    last_four: string;
    exp_month: string;
    exp_year: string;
    card_holder: string;
  };
}

export const PaymentCard = ({ publicData }: PaymentCardProps) => {
  const { last_four, exp_month, exp_year, card_holder } = publicData;
  const expirationDate = `${exp_month.padStart(2, '0')}/${exp_year.slice(-2)}`;

  return (
    <div className="w-full max-w-80">
      <div className="relative h-48 w-full rounded-2xl bg-gradient-to-br from-green-300 via-green-400 to-green-500 p-6 text-white shadow-lg">
        <div className="mb-8 flex items-start justify-between">
          <div className="text-blue-900">
            <ComponentPlaceholderIcon className="h-8 w-8" />
          </div>
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-yellow-200">
            <div className="h-4 w-4 rounded-full border-2 border-orange-600"></div>
          </div>
        </div>
        <div className="mb-4">
          <div className="font-mono text-xl tracking-wider text-blue-900">**** **** **** {last_four}</div>
        </div>
        <div className="flex items-end justify-between">
          <div>
            <div className="mb-1 text-sm text-green-700">Titular</div>
            <div className="text-lg font-semibold text-blue-900">{card_holder}</div>
          </div>
          <div className="text-right">
            <div className="mb-1 text-sm text-green-700">Vence</div>
            <div className="font-mono text-lg text-blue-900">{expirationDate}</div>
          </div>
        </div>
      </div>
    </div>
  );
};
