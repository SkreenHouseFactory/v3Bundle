<?php

namespace SkreenHouseFactory\v3Bundle\Twig\Extension;

use Symfony\Component\HttpKernel\KernelInterface;

class broadcastdateExtension extends \Twig_Extension
{
    public function __construct()
    {
    }

    /**
     * {@inheritdoc}
     */
    public function getFilters()
    {
        return array(
            'broadcastdate' => new \Twig_Filter_Method($this, 'broadcastdate'),
            'remainingtv' => new \Twig_Filter_Method($this, 'remainingtv'),
            'remainingreplay' => new \Twig_Filter_Method($this, 'remainingreplay'),
            'timeleft' => new \Twig_Filter_Method($this, 'timeleft'),
        );
    }

    /**
     * Returns the name of the extension.
     *
     * @return string The extension name
     */
    public function getName()
    {
        return 'broadcastdate';
    }

    /**
     * get remaining time message
     * 
     * @param string $string
     * @return int 
     */
    public function remainingtv ($time)
    {
			$remaining = $time - time() + 3600;
			if ($remaining < 0) {
				return 'Bientôt disponible en Replay';
			} elseif ($remaining/3600 < 24 ) {
				return 'En Replay dans ' . round($remaining/3600) . ' heures';
			} elseif ($remaining/3600 < 73 ) {
				return 'En Replay dans ' . round($remaining/(3600*24)) . ' jours';
			}
    }

    /**
     * get remaining time message
     * 
     * @param string $string
     * @return int 
     */
    public function remainingreplay ($time)
    {
			$remaining = $time - time() + 3600;
			if ($remaining < 0) {
			} elseif ($remaining/3600 < 24 ) {
				return 'Plus que ' . round($remaining/3600) . ' heures pour le voir';
			} elseif ($remaining/3600 < 73 ) {
				return 'Plus que ' . round($remaining/(3600*24)) . ' jours pour le voir';
			}
    }

    /**
     * get time left message
     * 
     * @param string $string
     * @return int 
     */
    public function timeleft ($time)
    {
			$timeleft = time() - $time;
			if ($timeleft < 0) {
				return;
			}
			if ($timeleft/3600 < 24) {
				return round($timeleft/3600) . ' heures';
			} elseif ($timeleft/3600 < 72) {
				return round($timeleft/(3600*24)) . ' jours';
			}
    }

    /**
     * Converts a string to time
     * 
     * @param string $string
     * @return int 
     */
    public function broadcastdate ($time)
    {
			if ($time) {
				$month = $this->getMonth(date('m', $time));
				$tomorrow = 'le ' . date('d', $time + 24*3600) . ' ' . $this->getMonth(date('m', $time + 24*3600));
				$yesterday = 'le ' . date('d', $time - 24*3600) . ' ' . $this->getMonth(date('m', $time - 24*3600));
				$string = 'le ' . date('d', $time) . ' ' . $month . ' à ' . date('G\hi', $time);
				$string = str_replace('le ' . date('d ') . $month, 'Aujourd\'hui', $string); //today
				if (strstr($string, $tomorrow .' 2')) {
					$string = str_replace($tomorrow, 'Demain soir', $string); //tommorow night
				}
				if (strstr($string, $yesterday .' 2')) {
					$string = str_replace($yesterday, 'Hier soir', $string); //yesterday night
				}
				$string = str_replace($tomorrow, 'Demain', $string); //tommorow
				$string = str_replace($yesterday, 'Hier', $string); //yesterday

	    	return $string;
			}
    }

    /**
     * Converts a string to time
     * 
     * @param string $string
     * @return int 
     */
    protected function getMonth ($number)
    {
			switch((int)$number) {
				case 1: return 'Janv.'; break;
				case 2: return 'Fév.'; break;
				case 3: return 'Mars'; break;
				case 4: return 'Avril'; break;
				case 5: return 'Mai'; break;
				case 6: return 'Juin'; break;
				case 7: return 'Juil.'; break;
				case 8: return 'Août'; break;
				case 9: return 'Sept.'; break;
				case 10: return 'Oct.'; break;
				case 11: return 'Nov.'; break;
				case 12: return 'Déc.'; break;
			}
		}
}