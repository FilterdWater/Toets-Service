<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Validation Language Lines
    |--------------------------------------------------------------------------
    |
    | The following language lines contain the default error messages used by
    | the validator class. Some of these rules have multiple versions such
    | as the size rules. Feel free to tweak each of these messages here.
    |
    */

    'accepted' => 'Het veld :attribute moet geaccepteerd worden.',
    'accepted_if' => 'Het veld :attribute moet geaccepteerd worden wanneer :other gelijk is aan :value.',
    'active_url' => 'Het veld :attribute moet een geldige URL zijn.',
    'after' => 'Het veld :attribute moet een datum na :date zijn.',
    'after_or_equal' => 'Het veld :attribute moet een datum na of gelijk aan :date zijn.',
    'alpha' => 'Het veld :attribute mag alleen letters bevatten.',
    'alpha_dash' => 'Het veld :attribute mag alleen letters, cijfers, streepjes en underscores bevatten.',
    'alpha_num' => 'Het veld :attribute mag alleen letters en cijfers bevatten.',
    'any_of' => 'Het veld :attribute is ongeldig.',
    'array' => 'Het veld :attribute moet een array zijn.',
    'ascii' => 'Het veld :attribute mag alleen single-byte alfanumerieke tekens en symbolen bevatten.',
    'before' => 'Het veld :attribute moet een datum vóór :date zijn.',
    'before_or_equal' => 'Het veld :attribute moet een datum vóór of gelijk aan :date zijn.',
    'between' => [
        'array' => 'Het veld :attribute moet tussen :min en :max items bevatten.',
        'file' => 'Het veld :attribute moet tussen :min en :max kilobytes zijn.',
        'numeric' => 'Het veld :attribute moet tussen :min en :max liggen.',
        'string' => 'Het veld :attribute moet tussen :min en :max tekens bevatten.',
    ],
    'boolean' => 'Het veld :attribute moet true of false zijn.',
    'can' => 'Het veld :attribute bevat een niet-toegestane waarde.',
    'confirmed' => 'De bevestiging van :attribute komt niet overeen.',
    'contains' => 'Het veld :attribute mist een vereiste waarde.',
    'current_password' => 'Het wachtwoord is onjuist.',
    'date' => 'Het veld :attribute moet een geldige datum zijn.',
    'date_equals' => 'Het veld :attribute moet gelijk zijn aan datum :date.',
    'date_format' => 'Het veld :attribute moet het formaat :format hebben.',
    'decimal' => 'Het veld :attribute moet :decimal decimalen bevatten.',
    'declined' => 'Het veld :attribute moet geweigerd worden.',
    'declined_if' => 'Het veld :attribute moet geweigerd worden wanneer :other gelijk is aan :value.',
    'different' => 'Het veld :attribute en :other moeten verschillend zijn.',
    'digits' => 'Het veld :attribute moet :digits cijfers bevatten.',
    'digits_between' => 'Het veld :attribute moet tussen :min en :max cijfers bevatten.',
    'dimensions' => 'Het veld :attribute heeft ongeldige afbeeldingsafmetingen.',
    'distinct' => 'Het veld :attribute bevat een dubbele waarde.',
    'doesnt_contain' => 'Het veld :attribute mag geen van de volgende waarden bevatten: :values.',
    'doesnt_end_with' => 'Het veld :attribute mag niet eindigen op één van de volgende: :values.',
    'doesnt_start_with' => 'Het veld :attribute mag niet beginnen met één van de volgende: :values.',
    'email' => 'Het veld :attribute moet een geldig e-mailadres zijn.',
    'encoding' => 'Het veld :attribute moet gecodeerd zijn in :encoding.',
    'ends_with' => 'Het veld :attribute moet eindigen op één van de volgende: :values.',
    'enum' => 'De geselecteerde :attribute is ongeldig.',
    'exists' => 'De geselecteerde :attribute is ongeldig.',
    'extensions' => 'Het veld :attribute moet één van de volgende extensies hebben: :values.',
    'file' => 'Het veld :attribute moet een bestand zijn.',
    'filled' => 'Het veld :attribute moet een waarde bevatten.',
    'gt' => [
        'array' => 'Het veld :attribute moet meer dan :value items bevatten.',
        'file' => 'Het veld :attribute moet groter zijn dan :value kilobytes.',
        'numeric' => 'Het veld :attribute moet groter zijn dan :value.',
        'string' => 'Het veld :attribute moet meer dan :value tekens bevatten.',
    ],
    'gte' => [
        'array' => 'Het veld :attribute moet :value items of meer bevatten.',
        'file' => 'Het veld :attribute moet groter dan of gelijk zijn aan :value kilobytes.',
        'numeric' => 'Het veld :attribute moet groter dan of gelijk zijn aan :value.',
        'string' => 'Het veld :attribute moet groter dan of gelijk zijn aan :value tekens.',
    ],
    'hex_color' => 'Het veld :attribute moet een geldige hexadecimale kleur zijn.',
    'image' => 'Het veld :attribute moet een afbeelding zijn.',
    'in' => 'De geselecteerde :attribute is ongeldig.',
    'in_array' => 'Het veld :attribute moet voorkomen in :other.',
    'in_array_keys' => 'Het veld :attribute moet ten minste één van de volgende sleutels bevatten: :values.',
    'integer' => 'Het veld :attribute moet een geheel getal zijn.',
    'ip' => 'Het veld :attribute moet een geldig IP-adres zijn.',
    'ipv4' => 'Het veld :attribute moet een geldig IPv4-adres zijn.',
    'ipv6' => 'Het veld :attribute moet een geldig IPv6-adres zijn.',
    'json' => 'Het veld :attribute moet een geldige JSON-string zijn.',
    'list' => 'Het veld :attribute moet een lijst zijn.',
    'lowercase' => 'Het veld :attribute moet kleine letters bevatten.',
    'lt' => [
        'array' => 'Het veld :attribute moet minder dan :value items bevatten.',
        'file' => 'Het veld :attribute moet kleiner zijn dan :value kilobytes.',
        'numeric' => 'Het veld :attribute moet kleiner zijn dan :value.',
        'string' => 'Het veld :attribute moet minder dan :value tekens bevatten.',
    ],
    'lte' => [
        'array' => 'Het veld :attribute mag niet meer dan :value items bevatten.',
        'file' => 'Het veld :attribute moet kleiner dan of gelijk zijn aan :value kilobytes.',
        'numeric' => 'Het veld :attribute moet kleiner dan of gelijk zijn aan :value.',
        'string' => 'Het veld :attribute moet kleiner dan of gelijk zijn aan :value tekens.',
    ],
    'mac_address' => 'Het veld :attribute moet een geldig MAC-adres zijn.',
    'max' => [
        'array' => 'Het veld :attribute mag niet meer dan :max items bevatten.',
        'file' => 'Het veld :attribute mag niet groter zijn dan :max kilobytes.',
        'numeric' => 'Het veld :attribute mag niet groter zijn dan :max.',
        'string' => 'Het veld :attribute mag niet meer dan :max tekens bevatten.',
    ],
    'max_digits' => 'Het veld :attribute mag niet meer dan :max cijfers bevatten.',
    'mimes' => 'Het veld :attribute moet een bestand zijn van type: :values.',
    'mimetypes' => 'Het veld :attribute moet een bestand zijn van type: :values.',
    'min' => [
        'array' => 'Het veld :attribute moet minimaal :min items bevatten.',
        'file' => 'Het veld :attribute moet minimaal :min kilobytes zijn.',
        'numeric' => 'Het veld :attribute moet minimaal :min zijn.',
        'string' => 'Het veld :attribute moet minimaal :min tekens bevatten.',
    ],
    'min_digits' => 'Het veld :attribute moet minimaal :min cijfers bevatten.',
    'missing' => 'Het veld :attribute moet ontbreken.',
    'missing_if' => 'Het veld :attribute moet ontbreken wanneer :other gelijk is aan :value.',
    'missing_unless' => 'Het veld :attribute moet ontbreken tenzij :other gelijk is aan :value.',
    'missing_with' => 'Het veld :attribute moet ontbreken wanneer :values aanwezig is.',
    'missing_with_all' => 'Het veld :attribute moet ontbreken wanneer :values aanwezig zijn.',
    'multiple_of' => 'Het veld :attribute moet een veelvoud zijn van :value.',
    'not_in' => 'De geselecteerde :attribute is ongeldig.',
    'not_regex' => 'Het formaat van :attribute is ongeldig.',
    'numeric' => 'Het veld :attribute moet een getal zijn.',
    'password' => [
        'letters' => 'Het veld :attribute moet minimaal één letter bevatten.',
        'mixed' => 'Het veld :attribute moet minimaal één hoofdletter en één kleine letter bevatten.',
        'numbers' => 'Het veld :attribute moet minimaal één cijfer bevatten.',
        'symbols' => 'Het veld :attribute moet minimaal één symbool bevatten.',
        'uncompromised' => 'Het opgegeven :attribute komt voor in een datalek. Kies een andere :attribute.',
    ],
    'present' => 'Het veld :attribute moet aanwezig zijn.',
    'present_if' => 'Het veld :attribute moet aanwezig zijn wanneer :other gelijk is aan :value.',
    'present_unless' => 'Het veld :attribute moet aanwezig zijn tenzij :other gelijk is aan :value.',
    'present_with' => 'Het veld :attribute moet aanwezig zijn wanneer :values aanwezig is.',
    'present_with_all' => 'Het veld :attribute moet aanwezig zijn wanneer :values aanwezig zijn.',
    'prohibited' => 'Het veld :attribute is niet toegestaan.',
    'prohibited_if' => 'Het veld :attribute is niet toegestaan wanneer :other gelijk is aan :value.',
    'prohibited_if_accepted' => 'Het veld :attribute is niet toegestaan wanneer :other is geaccepteerd.',
    'prohibited_if_declined' => 'Het veld :attribute is niet toegestaan wanneer :other is geweigerd.',
    'prohibited_unless' => 'Het veld :attribute is niet toegestaan tenzij :other voorkomt in :values.',
    'prohibits' => 'Het veld :attribute verhindert dat :other aanwezig is.',
    'regex' => 'Het formaat van :attribute is ongeldig.',
    'required' => 'Het veld :attribute is verplicht.',
    'required_array_keys' => 'Het veld :attribute moet de volgende sleutels bevatten: :values.',
    'required_if' => 'Het veld :attribute is verplicht wanneer :other gelijk is aan :value.',
    'required_if_accepted' => 'Het veld :attribute is verplicht wanneer :other is geaccepteerd.',
    'required_if_declined' => 'Het veld :attribute is verplicht wanneer :other is geweigerd.',
    'required_unless' => 'Het veld :attribute is verplicht tenzij :other voorkomt in :values.',
    'required_with' => 'Het veld :attribute is verplicht wanneer :values aanwezig is.',
    'required_with_all' => 'Het veld :attribute is verplicht wanneer :values aanwezig zijn.',
    'required_without' => 'Het veld :attribute is verplicht wanneer :values niet aanwezig is.',
    'required_without_all' => 'Het veld :attribute is verplicht wanneer geen van :values aanwezig zijn.',
    'same' => 'Het veld :attribute moet overeenkomen met :other.',
    'size' => [
        'array' => 'Het veld :attribute moet :size items bevatten.',
        'file' => 'Het veld :attribute moet :size kilobytes zijn.',
        'numeric' => 'Het veld :attribute moet :size zijn.',
        'string' => 'Het veld :attribute moet :size tekens bevatten.',
    ],
    'starts_with' => 'Het veld :attribute moet beginnen met één van de volgende: :values.',
    'string' => 'Het veld :attribute moet een string zijn.',
    'timezone' => 'Het veld :attribute moet een geldige tijdzone zijn.',
    'unique' => 'De :attribute is al in gebruik.',
    'uploaded' => 'Het uploaden van :attribute is mislukt.',
    'uppercase' => 'Het veld :attribute moet hoofdletters bevatten.',
    'url' => 'Het veld :attribute moet een geldige URL zijn.',
    'ulid' => 'Het veld :attribute moet een geldige ULID zijn.',
    'uuid' => 'Het veld :attribute moet een geldige UUID zijn.',

    /*
    |--------------------------------------------------------------------------
    | Custom Validation Language Lines
    |--------------------------------------------------------------------------
    |
    | Here you may specify custom validation messages for attributes using the
    | convention "attribute.rule" to name the lines. This makes it quick to
    | specify a specific custom language line for a given attribute rule.
    |
    */

    'custom' => [
        'attribute-name' => [
            'rule-name' => 'custom-message',
        ],
    ],

    /*
    |--------------------------------------------------------------------------
    | Custom Validation Attributes
    |--------------------------------------------------------------------------
    |
    | The following language lines are used to swap our attribute placeholder
    | with something more reader friendly such as "E-Mail Address" instead
    | of "email". This simply helps us make our message more expressive.
    |
    */

    'attributes' => [],

];
