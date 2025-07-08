interface CustomTooltipProps {
  active?: boolean;
  payload?: any[];
  label?: string;
}

export const CustomTooltip = ({ active, payload, label }: CustomTooltipProps) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-background p-3 border border-border rounded-lg shadow-lg">
        <p className="text-foreground font-medium">{`${label}`}</p>
        <p className="text-primary">
          {`Cadastros: ${payload[0].value}`}
        </p>
      </div>
    );
  }
  return null;
};