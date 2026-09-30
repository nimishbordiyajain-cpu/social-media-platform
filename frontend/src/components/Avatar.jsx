// Round avatar with the first letter of the username. Colour is picked from the name,
// so the same person always gets the same colour.
const COLORS = ['#2340d9', '#0f9d8a', '#d6336c', '#e67700', '#7048e8', '#1c7ed6'];

export const avatarColor = (name = '?') => {
  let hash = 0;
  for (const ch of name) hash = (hash * 31 + ch.charCodeAt(0)) % 997;
  return COLORS[hash % COLORS.length];
};

export default function Avatar({ name = '?', size = 42 }) {
  return (
    <span
      className="avatar"
      style={{ width: size, height: size, fontSize: size * 0.42, background: avatarColor(name) }}
      aria-hidden="true"
    >
      {name.charAt(0).toUpperCase()}
    </span>
  );
}
