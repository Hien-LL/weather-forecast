import { AlertCircle, RotateCw } from "lucide-react";
export default function ErrorMessage({
  message,
  retry,
}: {
  message: string;
  retry?: () => void;
}) {
  return (
    <div role="alert" className="state-card">
      <AlertCircle size={30} />
      <p>{message}</p>
      {retry && (
        <button className="pill" onClick={retry}>
          <RotateCw size={15} /> Try again
        </button>
      )}
    </div>
  );
}
