const { DataTypes } = require("sequelize");
const bcrypt = require('bcryptjs');

module.exports = (sequelize) => {
    const Utilisateur = sequelize.define('Utilisateur', {
        id_utilisateur: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
            allowNull: false,
        },
        nom: {
            type: DataTypes.STRING(50),
            allowNull: false,
            validate: {
                notEmpty: true,
                len: [2, 50]
            }
        },
        prenom: {
            type: DataTypes.STRING(50),
            allowNull: false,
            validate: {
                notEmpty: true,
                len: [2, 50]
            }
        },
        email: {
            type: DataTypes.STRING(100),
            allowNull: false,
            unique: true,
            validate: {
                isEmail: true,
                notEmpty: true
            }
        },
        mot_de_passe: {
            type: DataTypes.STRING(255),
            allowNull: false,
            validate: {
                notEmpty: true,
                len: [6, 255]
            }
        },
        role: {
            type: DataTypes.ENUM(
                'admin',
                'secretaire'
            ),
            defaultValue: 'secretaire',
            allowNull: false,
            validate: {
                notEmpty: true
            }
        },
        statut: {
            type: DataTypes.ENUM('actif', 'inactif', 'en_attente_validation', 'suspendu'),
            defaultValue: 'en_attente_validation',
            allowNull: false
        },
        date_derniere_connexion: {
            type: DataTypes.DATE,
            allowNull: true
        },
        avatar_url: {
            type: DataTypes.STRING(500),
            allowNull: true,
            validate: {
                isUrl: true
            }
        },
        reset_password_token: {
            type: DataTypes.STRING(255),
            allowNull: true
        },
        reset_password_expires: {
            type: DataTypes.DATE,
            allowNull: true
        },
        last_ip_address: {
            type: DataTypes.STRING(45),
            allowNull: true
        },
        preferences: {
            type: DataTypes.JSONB,
            allowNull: true,
            defaultValue: {}
        },
        // =================================================================
        // === CHAMPS 2FA (AUTHENTIFICATION À DOUBLE FACTEUR) ===
        // =================================================================
        two_factor_enabled: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false,
            comment: 'Indique si l\'authentification à double facteur est activée'
        },
        two_factor_secret: {
            type: DataTypes.STRING(32),
            allowNull: true,
            comment: 'Secret TOTP pour l\'authentification 2FA (chiffré)'
        },
        two_factor_recovery_codes: {
            type: DataTypes.JSONB,
            allowNull: true,
            comment: 'Codes de récupération 2FA (chiffrés)'
        },
        two_factor_backup_codes_used: {
            type: DataTypes.JSONB,
            allowNull: true,
            defaultValue: [],
            comment: 'Codes de récupération 2FA déjà utilisés'
        },
        two_factor_last_used: {
            type: DataTypes.DATE,
            allowNull: true,
            comment: 'Date de dernière utilisation du 2FA'
        }
    }, {
        tableName: 'Utilisateurs',
        timestamps: true,
        paranoid: true, // Active la suppression douce (soft delete)
        defaultScope: {
            attributes: { exclude: ['mot_de_passe', 'reset_password_token', 'reset_password_expires'] }
        },
        scopes: {
            withPassword: {
                attributes: { include: ['mot_de_passe'] }
            },
            withResetToken: {
                attributes: { include: ['reset_password_token', 'reset_password_expires'] }
            }
        },
        hooks: {
            beforeCreate: async (user) => {
                if (user.mot_de_passe) {
                    const salt = await bcrypt.genSalt(10);
                    user.mot_de_passe = await bcrypt.hash(user.mot_de_passe, salt);
                }
            },
            beforeUpdate: async (user) => {
                if (user.changed('mot_de_passe')) {
                    const salt = await bcrypt.genSalt(10);
                    user.mot_de_passe = await bcrypt.hash(user.mot_de_passe, salt);
                }
            },
            afterCreate: (user) => {
                // Suppression des données sensibles avant l'envoi de la réponse
                delete user.dataValues.mot_de_passe;
                delete user.dataValues.reset_password_token;
                delete user.dataValues.reset_password_expires;
            }
        }
    });

    // Méthode d'instance pour comparer les mots de passe hachés
    Utilisateur.prototype.comparePassword = async function(candidatePassword) {
        return await bcrypt.compare(candidatePassword, this.mot_de_passe);
    };

    // Méthode pour générer un token de réinitialisation de mot de passe
    Utilisateur.prototype.generatePasswordReset = function() {
        const crypto = require('crypto');
        this.reset_password_token = crypto.randomBytes(20).toString('hex');
        this.reset_password_expires = Date.now() + 3600000; // 1 heure d'expiration
    };

    // Méthode pour vérifier si le token de réinitialisation est valide
    Utilisateur.prototype.validPasswordResetToken = function() {
        return this.reset_password_expires > Date.now();
    };

    // Méthode pour obtenir le nom complet de l'utilisateur
    Utilisateur.prototype.getFullName = function() {
        return `${this.prenom} ${this.nom}`.trim();
    };

    return Utilisateur;
};