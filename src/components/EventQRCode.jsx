import QRCode from "qrcode.react";

export default function EventQRCode({ eventId }) {
  // You can encode any info in the QR. Here, we just use the eventId,
  // you could also include orgId or a unique attendance link
  const qrValue = JSON.stringify({ eventId });

  return (
    <div className="flex flex-col items-center p-4 bg-white dark:bg-gray-800 rounded-lg shadow">
      <QRCode value={qrValue} size={200} />
      <p className="mt-2 text-gray-700 dark:text-gray-200 text-center">
        Scan this QR code to mark attendance
      </p>
    </div>
  );
}