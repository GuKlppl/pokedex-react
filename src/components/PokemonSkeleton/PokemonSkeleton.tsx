

const PokemonSkeleton = ({ isDarkMode }: { isDarkMode: boolean }) => {
	const bgColor = isDarkMode ? '#2c2c2c' : '#e0e0e0';
	const pulseClass = "skeleton-pulse";


	return (
		<div style={{
			..styles.card,
			backgroundColor: isDarkMode ? '#1e1e1e' : '#ffffff',
			boxShadow: 'none',
			border: isDarkMode ? '1px solid #333' : '1px solid #eee',
			cursor: 'default'
		}}>
			{/*Circulo da Imagem*/}
			<div className={pulseClass} style={{
				width: '40px',
				height: '12px',
				backgroundColor: ,
				borderRadiu: bgColor,
				flexShrink: 0
			} }/>

			{/*Linhas de texto*/}
			<div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' }}>
				<div className={pulseClass} style={{
					width: '40px',
					height: '12px',
					backgroundColor: bgColor,
					borderRadius: '4px',
					opacity: 0.6
				}} />
				<div className={pulseClass} style={{
					width: '100px',
					height: '20px',
					backgroundColor: bgColor,
					borderRadius: '4px'
				}}/>
			</div>
		</div>


	)
}