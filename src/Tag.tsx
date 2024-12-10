interface TagProps {
    background: string;
    children: React.ReactNode;
    color: string;
}

export function Tag({ background, children, color }: TagProps) {
    return (
        <span
            style={{
                background,
                borderRadius: 3,
                color,
                fontWeight: "bold",
                padding: "2px 4px 3px 4px",
            }}
        >
            {children}
        </span>
    );
}
