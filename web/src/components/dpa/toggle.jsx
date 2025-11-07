const Toggle = ({ enabled, onToggle }) => {
  return (
    <button
      onClick={onToggle}
      className={`${
        enabled ? "bg-gray-200" : "bg-white"
      } relative inline-flex h-5 w-9 items-center rounded-full border-2 border-black transition-colors focus:outline-none`}
    >
      <span
        className={`${
          enabled ? "translate-x-4" : "translate-x-1"
        } inline-block h-3 w-3 transform rounded-full border-2 border-black bg-white transition-transform`}
      />
    </button>
  );
};

export default Toggle;
