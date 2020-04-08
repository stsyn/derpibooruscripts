function getBadgesImplications() {
	return {
		normal:{
			'Hard Work':['Perfect Pony Plot Provider','Artist'],
			'HARD WERK':['Perfect Pony Plot Provider','Artist'],
			'Best Artist':['Artist'],
			'Da Magicks!':['Fine Arts','Artist'],

			'An Artist Who Rocks':['Artist'],
			'A Really Classy Artist':['An Artist Who Rocks','Artist'],
			'A Really Hyper Artist':['A Really Classy Artist','An Artist Who Rocks','Artist'],
			'Chaotic Little Trees':['A Really Hyper Artist','A Really Classy Artist','An Artist Who Rocks','Artist'],

			'Cool Crow':['Magnificent Metadata Maniac'],

			'Bronze Patron':['Happy Derpy'],
			'Silver Patron':['Happy Derpy'],
			'Gold Patron':['Happy Derpy'],
			'Platinum Patron':['Happy Derpy']
		},
		extreme:{
			'Friendship, Art, and Magic (2018)':['Friendship, Art, and Magic (2017)'],
			'Friendship, Art, and Magic (2019)':['Friendship, Art, and Magic (2017)','Friendship, Art, and Magic (2018)'],
			'Friendship, Art, and Magic (2020)':['Friendship, Art, and Magic (2017)','Friendship, Art, and Magic (2018)','Friendship, Art, and Magic (2019)'],
			'Helpful Owl':['Friendly Griffon'],
			'Toola Roola':['Friendly Griffon', 'Helpful Owl'],
			'Dream Come True!':['Friendly Griffon', 'Helpful Owl', 'Toola Roola'],

			'Equality':['Not a Llama'],
			'Condensed Milk':['Not a Llama'],
			'Wallet After Summer Sale':['Not a Llama', 'Equality', 'Condensed Milk'],
			'Economist':['Not a Llama', 'Equality', 'Condensed Milk'],
			'My Little Pony':['Not a Llama', 'Equality', 'Condensed Milk', 'Economist', 'Wallet After Summer Sale'],
			'Best Art Program Ever':['Not a Llama', 'Equality', 'Condensed Milk', 'Economist', 'Wallet After Summer Sale', 'My Little Pony'],

			'A Tale For The Ages':['Birthday Cake'],
			'Dream Come True!':['Birthday Cake', 'A Tale For The Ages'],
		},
		donations:{
			'Platinum Patron':['Emerald','Ruby','Sapphire','Diamond','Heart Gem','Element of Generosity','Gold Bit','Silver Bit','Bronze Bit'],
			'Gold Patron':['Emerald','Ruby','Sapphire','Diamond','Heart Gem','Element of Generosity','Silver Bit','Bronze Bit'],
			'Silver Patron':['Emerald','Ruby','Sapphire','Diamond','Heart Gem','Element of Generosity','Bronze Bit'],
			'Bronze Patron':['Emerald','Ruby','Sapphire','Diamond','Heart Gem','Element of Generosity'],

			'Platinum Bit':['Emerald','Ruby','Sapphire','Diamond','Heart Gem','Element of Generosity','Platinum Patron','Gold Patron','Silver Patron','Bronze Patron'],
			'Gold Bit':['Emerald','Ruby','Sapphire','Diamond','Heart Gem','Element of Generosity','Gold Patron','Silver Patron','Bronze Patron'],
			'Silver Bit':['Emerald','Ruby','Sapphire','Diamond','Heart Gem','Element of Generosity','Silver Patron','Bronze Patron'],
			'Bronze Bit':['Emerald','Ruby','Sapphire','Diamond','Heart Gem','Element of Generosity','Bronze Patron']
		}
	};
}
