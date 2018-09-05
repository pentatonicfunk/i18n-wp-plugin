import i18n from 'index';

const numDays = 5;
i18n.translate('translate');
i18n.translate('%(numberOfDays)d day.', '%(numberOfDays)d days.', {
	count: numDays,
	args: {
		numberOfDays: numDays,
	},
});

i18n.translate('translate');
