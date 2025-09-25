// Wallet connection and user data management
class WalletManager {
    constructor() {
        this.wallet = null;
        this.userData = JSON.parse(localStorage.getItem('consilience_user')) || null;
    }

    async connectWallet() {
        try {
            if (window.solana && window.solana.isPhantom) {
                const response = await window.solana.connect();
                this.wallet = response.publicKey.toString();
                
                // Update user data with wallet
                if (this.userData) {
                    this.userData.wallet_address = this.wallet;
                    localStorage.setItem('consilience_user', JSON.stringify(this.userData));
                }
                
                this.updateWalletUI();
                return this.wallet;
            } else {
                alert('Please install Phantom wallet: https://phantom.app/');
                return null;
            }
        } catch (error) {
            console.error('Wallet connection failed:', error);
            return null;
        }
    }

    updateWalletUI() {
        const walletBtn = document.getElementById('walletBtn');
        const userStatus = document.getElementById('userStatus');
        
        if (this.wallet) {
            walletBtn.textContent = `${this.wallet.slice(0, 4)}...${this.wallet.slice(-4)}`;
            walletBtn.style.background = '#00ff00';
            walletBtn.style.color = '#000';
        }
        
        if (this.userData) {
            userStatus.innerHTML = `
                <div class="user-card">
                    <div class="user-name">${this.userData.alias}</div>
                    <div class="user-status">💰 ${this.userData.cs_balance || 0} CS</div>
                    <div class="user-status">🎨 ${this.userData.nfts || 0} NFTs</div>
                    <div class="user-status">🪙 ${this.userData.tokens || 0} Tokens</div>
                    <div class="user-status">🔑 ${this.wallet ? this.wallet.slice(0, 12) + '...' : 'No wallet'}</div>
                </div>
            `;
        }
    }

    async awardCS(amount, reason) {
        if (!this.userData) return;
        
        this.userData.cs_balance = (this.userData.cs_balance || 0) + amount;
        this.userData.achievements = this.userData.achievements || [];
        this.userData.achievements.push({
            type: 'cs_reward',
            amount,
            reason,
            timestamp: new Date().toISOString()
        });
        
        localStorage.setItem('consilience_user', JSON.stringify(this.userData));
        this.updateWalletUI();
        
        // Show achievement notification
        this.showAchievement(`+${amount} CS - ${reason}`);
    }

    async recordNFT(mintAddress, tokenId) {
        if (!this.userData) return;
        
        this.userData.nfts = (this.userData.nfts || 0) + 1;
        this.userData.achievements = this.userData.achievements || [];
        this.userData.achievements.push({
            type: 'nft_created',
            mintAddress,
            tokenId,
            timestamp: new Date().toISOString()
        });
        
        localStorage.setItem('consilience_user', JSON.stringify(this.userData));
        this.updateWalletUI();
        this.awardCS(25, 'NFT Creation');
    }

    async recordToken(mintAddress, symbol) {
        if (!this.userData) return;
        
        this.userData.tokens = (this.userData.tokens || 0) + 1;
        this.userData.achievements = this.userData.achievements || [];
        this.userData.achievements.push({
            type: 'token_created',
            mintAddress,
            symbol,
            timestamp: new Date().toISOString()
        });
        
        localStorage.setItem('consilience_user', JSON.stringify(this.userData));
        this.updateWalletUI();
        this.awardCS(50, 'Token Creation');
    }

    showAchievement(text) {
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #00ff00;
            color: #000;
            padding: 12px 16px;
            border-radius: 6px;
            font-family: 'JetBrains Mono', monospace;
            font-size: 12px;
            font-weight: 500;
            z-index: 1000;
            animation: slideIn 0.3s ease;
        `;
        notification.textContent = `🎉 ${text}`;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.remove();
        }, 3000);
    }

    getAchievements() {
        return this.userData?.achievements || [];
    }
}

// Add CSS for animation
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
`;
document.head.appendChild(style);

// Global wallet manager
window.walletManager = new WalletManager();