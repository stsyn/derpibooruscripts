function getDonateLink() {
	let donationLinks = ['https://www.paypal.me/stsyn', 'https://steamcommunity.com/id/stsyn/wishlist/','https://money.yandex.ru/to/410014956085536']
	return donationLinks[parseInt(Math.random() * donationLinks.length)];
}
