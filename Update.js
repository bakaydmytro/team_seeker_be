//Функція оновлення даних користувача
async function updateUser(userId, newDetails) {
    try {
        const [updated] = await User.update(newDetails, {
            where: { id: userId }
        });

        if (updated) {
            console.log(`User with ID ${userId} was updated successfully.`);
        } else {
            console.log(`User with ID ${userId} not found or no changes made.`);
        }
    } catch (error) {
        console.error('Error updating user:', error);
    }
}

// Головна функція для оновлення та синхронізації
(async () => {
    try {
        // Приклад оновлення даних адміністратора
        await updateUser(adminUser.id, {
            email: 'new_admin@example.com',
            username: 'new_admin',
            password: 'new_secure_password',  // Потребує ще хешування
            birthday: new Date('1989-12-31')
        });
    } catch (error) {
        console.error('Error during user update:', error);
    }
})();