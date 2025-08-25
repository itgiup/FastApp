
export async function getGasFreeInfo(accountAddress: string): Promise<string | undefined> {
    try {
        const response = await fetch(`https://gasfree.io/api/v1/address/${accountAddress}`);

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        console.log('GasFree Info:', data);
        return data;
    } catch (error) {
        console.error('Error fetching GasFree info:', error);
    }
}
