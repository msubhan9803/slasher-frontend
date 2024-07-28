import { solid } from '@fortawesome/fontawesome-svg-core/import.macro';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

type Props = {
  noteList: string[];
};

export default function ListingPromotionDetails({ noteList }: Props) {
  return (
    <div>
      {noteList.map((notes: string) => (
        <div className="d-flex" key={notes}>
          <FontAwesomeIcon
            role="button"
            icon={solid('check')}
            size="sm"
            className="text-primary pe-2 mt-1"
          />
          <p className="fs-4 text-light">{notes}</p>
        </div>
      ))}
    </div>
  );
}
