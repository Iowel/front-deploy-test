package film

// type UserRepository struct {
// 	Db *db.Db
// }

// func NewUserReposotory(db *db.Db) *UserRepository {
// 	return &UserRepository{
// 		Db: db,
// 	}
// }

// func (u *UserRepository) GetAllUsers() ([]*User, error) {
// 	ctx, cancel := context.WithTimeout(context.Background(), 3*time.Second)
// 	defer cancel()

// 	query := `SELECT id, email, password, name, role, created_at, updated_at FROM users`

// 	rows, err := u.Db.Pool.Query(ctx, query)
// 	if err != nil {
// 		return nil, err
// 	}
// 	defer rows.Close()

// 	var users []*User

// 	for rows.Next() {
// 		var user User
// 		err := rows.Scan(
// 			&user.ID,
// 			&user.Email,
// 			&user.Password,
// 			&user.Name,
// 			&user.Role,
// 			&user.CreatedAt,
// 			&user.UpdatedAt,
// 		)
// 		if err != nil {
// 			return nil, err
// 		}
// 		users = append(users, &user)
// 	}

// 	if err := rows.Err(); err != nil {
// 		return nil, err
// 	}

// 	return users, nil
// }

// func (u *UserRepository) GetUserByID(id int) (*User, error) {
// 	ctx, cancel := context.WithTimeout(context.Background(), 3*time.Second)
// 	defer cancel()

// 	query := `
// 	select id, email, password, name, role from users where id = $1
// 	`

// 	row := u.Db.Pool.QueryRow(ctx, query, id)

// 	var user User
// 	err := row.Scan(&user.ID, &user.Email, &user.Password, &user.Name, &user.Role)
// 	if err != nil {
// 		if errors.Is(err, pgx.ErrNoRows) {
// 			return nil, fmt.Errorf("user with id %d not found", id)
// 		}
// 		return nil, fmt.Errorf("failed to get user: %w", err)
// 	}

// 	return &user, nil
// }

// func (u *UserRepository) AddUser(user *User, hash string) (*User, error) {
// 	ctx, cancel := context.WithTimeout(context.Background(), 3*time.Second)
// 	defer cancel()

// 	query := `
// 		INSERT INTO users (email, password, name, role)
// 		VALUES ($1, $2, $3, $4)
// 		RETURNING id, password, created_at, updated_at
// 	`

// 	err := u.Db.Pool.QueryRow(ctx, query, user.Email, hash, user.Name, user.Role).Scan(
// 		&user.ID,
// 		&user.Password,
// 		&user.CreatedAt,
// 		&user.UpdatedAt,
// 	)
// 	if err != nil {
// 		return nil, fmt.Errorf("failed to create user: %v", err)
// 	}

// 	return user, nil
// }

// func (u *UserRepository) UpdateUser(user *User, id int, pass string) (*User, error) {
// 	ctx, cancel := context.WithTimeout(context.Background(), 3*time.Second)
// 	defer cancel()

// 	query := `
// 		UPDATE
// 			users
// 		SET
// 			email = $2,
// 			name = $3,
// 			password = $4,
// 			role = $5
// 		WHERE
// 			id = $1
// 		RETURNING
// 			id, password, created_at, updated_at
// 	`

// 	err := u.Db.Pool.QueryRow(ctx, query, id, user.Email, user.Name, pass, user.Role).Scan(
// 		&user.ID,
// 		&user.Password,
// 		&user.CreatedAt,
// 		&user.UpdatedAt,
// 	)

// 	if err != nil {
// 		if errors.Is(err, pgx.ErrNoRows) {
// 			return nil, fmt.Errorf("user with ID %d not found", user.ID)
// 		}
// 		return nil, fmt.Errorf("failed to update user: %w", err)
// 	}

// 	return user, nil
// }

// func (u *UserRepository) DeleteUser(id int) error {
// 	ctx, cancel := context.WithTimeout(context.Background(), 3*time.Second)
// 	defer cancel()

// 	cmdTag, err := u.Db.Pool.Exec(ctx, `delete from users where id = $1`, id)

// 	if cmdTag.RowsAffected() == 0 {
// 		return err
// 	}

// 	return nil
// }
